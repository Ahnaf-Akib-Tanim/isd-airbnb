package com.airbnb.admin.client;

import com.airbnb.admin.dto.request.VerificationDecisionRequest;
import com.airbnb.admin.dto.response.UserAccessResponse;
import com.airbnb.admin.dto.response.UserProfileResponse;
import com.airbnb.admin.dto.response.VerificationResponse;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient.Builder webClientBuilder = WebClient.builder();

    @Value("${services.user-service.url:http://localhost:8081}")
    private String userServiceUrl;

    public List<UserProfileResponse> getAllUsers(String authorizationHeader) {
        UserProfileResponse[] response = webClientBuilder
            .build()
            .get()
            .uri(userServiceUrl + "/api/users/admin/all")
            .header("Authorization", authorizationHeader)
            .retrieve()
            .bodyToMono(UserProfileResponse[].class)
            .block();

        return response == null ? List.of() : Arrays.asList(response);
    }

    public UserProfileResponse getUserProfile(
        String userId,
        String authorizationHeader
    ) {
        return webClientBuilder
            .build()
            .get()
            .uri(userServiceUrl + "/api/users/" + userId)
            .header("Authorization", authorizationHeader)
            .retrieve()
            .bodyToMono(UserProfileResponse.class)
            .block();
    }

    public UserAccessResponse getUserAccess(
        String userId,
        String authorizationHeader
    ) {
        return webClientBuilder
            .build()
            .get()
            .uri(userServiceUrl + "/api/users/" + userId + "/access")
            .header("Authorization", authorizationHeader)
            .retrieve()
            .bodyToMono(UserAccessResponse.class)
            .block();
    }

    public VerificationResponse approveVerification(
        String userId,
        String authorizationHeader,
        String note
    ) {
        return webClientBuilder
            .build()
            .put()
            .uri(
                userServiceUrl +
                    "/api/users/admin/" +
                    userId +
                    "/approve-verification"
            )
            .header("Authorization", authorizationHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(buildDecisionRequest(note))
            .retrieve()
            .bodyToMono(VerificationResponse.class)
            .block();
    }

    public VerificationResponse rejectVerification(
        String userId,
        String authorizationHeader,
        String note
    ) {
        return webClientBuilder
            .build()
            .put()
            .uri(
                userServiceUrl +
                    "/api/users/admin/" +
                    userId +
                    "/reject-verification"
            )
            .header("Authorization", authorizationHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(buildDecisionRequest(note))
            .retrieve()
            .bodyToMono(VerificationResponse.class)
            .block();
    }

    private VerificationDecisionRequest buildDecisionRequest(String note) {
        VerificationDecisionRequest request = new VerificationDecisionRequest();
        request.setNote(note);
        return request;
    }
}
