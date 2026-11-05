import os
import uuid
import pypdf
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

def sanitize_and_save_pdf(file: UploadFile, user_id: str) -> Tuple[str, str, int]:
    """
    Validates uploaded PDF file size and type, saves to disk using safe UUID filename,
    and prevents path traversal attacks.
    Returns: (saved_filepath, unique_filename, file_size)
    """
    # 1. Validate content type and extension
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext != ".pdf" or file.content_type not in ["application/pdf", "application/x-pdf", "application/octet-stream"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF (.pdf) documents are accepted."
        )

    # 2. Ensure upload directory exists
    user_upload_dir = os.path.abspath(os.path.join(settings.UPLOAD_DIR, str(user_id)))
    os.makedirs(user_upload_dir, exist_ok=True)

    # 3. Read content and enforce size limit
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    content = file.file.read()
    file_size = len(content)

    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty."
        )

    # 4. Generate collision-free safe filename
    safe_filename = f"{uuid.uuid4().hex}.pdf"
    target_filepath = os.path.join(user_upload_dir, safe_filename)

    with open(target_filepath, "wb") as f:
        f.write(content)

    return target_filepath, safe_filename, file_size


def extract_text_from_pdf(file_path: str) -> Tuple[str, bool]:
    """
    Extracts text from a saved PDF file using PyPDF.
    Returns (extracted_text, is_scanned)
    """
    extracted_text = ""
    is_scanned = False

    try:
        reader = pypdf.PdfReader(file_path)
        if len(reader.pages) == 0:
            return "", False

        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

        extracted_text = extracted_text.strip()
        # If document has pages but less than 50 characters extracted, it is likely scanned / image-only
        if len(extracted_text) < 50:
            is_scanned = True

    except Exception as e:
        # If PyPDF fails to parse, return empty and mark scanned/unreadable
        extracted_text = ""
        is_scanned = True

    return extracted_text, is_scanned
