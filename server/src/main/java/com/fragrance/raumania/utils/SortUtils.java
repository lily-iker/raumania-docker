package com.fragrance.raumania.utils;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class SortUtils {

    public Sort buildSort(String sortBy, String sortDirection) {
        // Default sort is by "id" in ascending order if parameters are not valid
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "id";
        }

        if (sortDirection == null || sortDirection.isEmpty()) {
            sortDirection = "asc";
        }

        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return Sort.by(direction, sortBy);
    }
}