package com.cafe.onlinecafe.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Price {

    @Column(name = "amount_mkd")
    private Integer amount_mkd;

    @Column(name = "option_name")
    private String option;
}