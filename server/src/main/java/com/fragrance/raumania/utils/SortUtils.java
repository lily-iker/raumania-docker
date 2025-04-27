package com.fragrance.raumania.utils;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class SortUtils {

    /**
     * Resolves sorting based on the provided field and direction.
     * Defaults to sorting by "id" in ascending order if parameters are empty.
     *
     * @param sortBy The field to sort by (e.g., "name", "price").
     * @param sortDirection The sorting direction ("asc" or "desc").
     * @return A `Sort` object representing the sorting order.
     */
    public Sort buildSort(String sortBy, String sortDirection) {
        // Default sort is by "id" in ascending order if parameters are not valid
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "id";  // Default field
        }

        if (sortDirection == null || sortDirection.isEmpty()) {
            sortDirection = "asc";  // Default direction
        }

        // Resolve sort direction
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return Sort.by(direction, sortBy);
    }
}