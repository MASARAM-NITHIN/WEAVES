package com.sreepadmavathi.saree.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Stores uploads as Base64 data-URIs ({@code data:<mime>;base64,...}) which
 * callers persist in the existing TEXT columns (e.g. {@code image_url}).
 * Everything is therefore recoverable from a plain database backup — no files
 * on disk, no third-party storage provider.
 *
 * <p>Photos are downscaled (max 1200px, JPEG q0.82) on upload to keep rows
 * small — the same policy as the admin UI's client-side compressor.
 */
@Service
public class DatabaseImageStorageService implements ImageStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif", ".bmp", ".pdf"
    ));
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB input cap
    private static final int MAX_DIMENSION = 1200;
    private static final float JPEG_QUALITY = 0.82f;

    @Override
    public String uploadImage(MultipartFile file, String folder, String bucketName) throws IOException {
        validateFile(file);

        String contentType = file.getContentType();
        if (contentType == null || contentType.equals("application/octet-stream")) {
            contentType = guessContentType(file.getOriginalFilename());
        }
        byte[] bytes = file.getBytes();

        if (contentType != null && contentType.startsWith("image/") && !contentType.contains("svg")) {
            byte[] downscaled = downscaleToJpeg(bytes);
            if (downscaled != null) {
                bytes = downscaled;
                contentType = "image/jpeg";
            }
        }

        return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        String extension = getExtension(file.getOriginalFilename()).toLowerCase();
        if (!extension.isEmpty() && !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type: " + extension);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String guessContentType(String filename) {
        String ext = getExtension(filename).toLowerCase();
        switch (ext) {
            case ".png": return "image/png";
            case ".gif": return "image/gif";
            case ".webp": return "image/webp";
            case ".bmp": return "image/bmp";
            case ".pdf": return "application/pdf";
            default: return "image/jpeg";
        }
    }

    /**
     * Downscales to {@code MAX_DIMENSION} and re-encodes as JPEG.
     * Returns {@code null} when the bytes aren't a decodable image
     * (caller then stores the original bytes untouched).
     */
    private byte[] downscaleToJpeg(byte[] original) {
        try (ByteArrayInputStream in = new ByteArrayInputStream(original)) {
            BufferedImage img = ImageIO.read(in);
            if (img == null || img.getWidth() <= 0 || img.getHeight() <= 0) {
                return null;
            }
            double scale = Math.min(1.0, (double) MAX_DIMENSION / Math.max(img.getWidth(), img.getHeight()));
            int w = Math.max(1, (int) Math.round(img.getWidth() * scale));
            int h = Math.max(1, (int) Math.round(img.getHeight() * scale));

            BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = out.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.drawImage(img, 0, 0, w, h, null);
            g.dispose();

            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
            if (!writers.hasNext()) {
                return null;
            }
            ImageWriter writer = writers.next();
            try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                 MemoryCacheImageOutputStream ios = new MemoryCacheImageOutputStream(bytes)) {
                writer.setOutput(ios);
                ImageWriteParam param = writer.getDefaultWriteParam();
                if (param.canWriteCompressed()) {
                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                    param.setCompressionQuality(JPEG_QUALITY);
                }
                writer.write(null, new IIOImage(out, null, null), param);
                ios.flush();
                return bytes.toByteArray();
            } finally {
                writer.dispose();
            }
        } catch (Exception e) {
            return null;
        }
    }
}
