package com.fragrance.raumania.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        Map<String, String> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "raumania" // Specify the folder name in Cloudinary
        ));
        return uploadResult.get("url");
    }

    public void deleteAsset(String publicId) throws IOException {
        // Deleting the asset using its public ID
        if (publicId == null || publicId.isEmpty()) return;
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String getPublicIdFromUrl(String url) {

        // Example: https://res.cloudinary.com/demo/image/upload/v12345678/raumania/my-image.jpg

        // Split the URL at "/upload/" to separate the versioned path and file from the rest
        // The first part is the base URL, e.g., "https://res.cloudinary.com/demo/image"
        // The second part contains the version and the path to the image e.g., "v12345678/raumania/my-image.jpg"
        String[] parts = url.split("/upload/");

        // If the URL doesn't contain "/upload/", it's not a valid Cloudinary image URL
        if (parts.length < 2) {
            return null;
        }

        // Extract the portion after "/upload/", e.g., "v12345678/raumania/my-image.jpg"
        String pathAndFile = parts[1];

        // Remove the version prefix (e.g., "v12345678/") to get "raumania/my-image.jpg"
        pathAndFile = pathAndFile.substring(pathAndFile.indexOf("/") + 1);

        // Strip off the file extension (e.g., ".jpg") to get "raumania/my-image"
        return pathAndFile.substring(0, pathAndFile.lastIndexOf("."));
    }
}

