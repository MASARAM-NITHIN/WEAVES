package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.entity.Customer;
import com.sreepadmavathi.saree.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test") // Assuming there's a test profile or it falls back properly
public class CustomerServiceTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
    }

    @Test
    void testResolveCustomer_CalledTwice_ReturnsSameCustomerAndDoesNotDuplicate() {
        String phone = "9876543210";
        String name1 = "First Name";
        String name2 = "Updated Name";
        String address = "123 Street";

        // First call: Should create a new customer
        Customer firstCallCustomer = customerService.resolveCustomer(phone, name1, address);
        
        assertNotNull(firstCallCustomer.getId(), "Customer should be saved and have an ID");
        assertEquals(name1, firstCallCustomer.getCustomerName());

        // Second call: Should return existing customer and optionally update details
        Customer secondCallCustomer = customerService.resolveCustomer(phone, name2, address);

        assertEquals(firstCallCustomer.getId(), secondCallCustomer.getId(), "IDs should match indicating the exact same row");
        assertEquals(name2, secondCallCustomer.getCustomerName(), "Name should be updated");

        // Verify that only one customer exists in DB with this phone
        long count = customerRepository.count();
        assertEquals(1, count, "There should only be 1 customer in the database");
    }
}
