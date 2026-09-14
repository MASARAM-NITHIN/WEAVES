package com.sreepadmavathi.saree.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Abstraction over image/file uploads (saree images, collection banners,
 * payment proofs). Implementations decide where bytes live; callers only
 * depend on this contract. Returned values are public URL strings that the
 * frontend can render directly — either data-URIs stored in the database
 * (e.g. {@code data:image/jpeg;base64,...}) or legacy {@code /uploads/...}
 * paths served from disk.
 */
public interface ImageStorageService {

    /**
     * Stores {@code file} under {@code folder} and returns its public URL path.
     *
     * @param file       uploaded file (validated by the implementation)
     * @param folder     logical sub-folder, e.g. {@code sarees}, {@code collections}
     * @param bucketName ignored by local implementations; kept for signature compatibility
     * @return public URL path of the stored file
     */
    String uploadImage(MultipartFile file, String folder, String bucketName) throws IOException;
}
