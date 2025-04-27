package com.fragrance.raumania.listener;

import com.fragrance.raumania.event.ProductIndexEvent;
import com.fragrance.raumania.service.interfaces.ProductIndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ProductIndexEventListener {
    private final ProductIndexService productIndexService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener
    public void handleProductIndexEvent(ProductIndexEvent event) {
        switch (event.getOperation()) {
            case CREATE, UPDATE -> productIndexService.indexProduct(event.getProductId());
            case DELETE -> productIndexService.unIndexProduct(event.getProductId());
        }
    }

}
