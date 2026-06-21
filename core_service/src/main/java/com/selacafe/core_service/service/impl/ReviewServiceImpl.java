package com.selacafe.core_service.service.impl;

import com.selacafe.core_service.entity.Menu;
import com.selacafe.core_service.entity.Review;
import com.selacafe.core_service.entity.User;
import com.selacafe.core_service.exception.BadRequestException;
import com.selacafe.core_service.exception.ResourceNotFoundException;
import com.selacafe.core_service.payload.req.ReviewReq;
import com.selacafe.core_service.payload.res.ReviewRes;
import com.selacafe.core_service.repository.MenuRepository;
import com.selacafe.core_service.repository.ReviewRepository;
import com.selacafe.core_service.service.AuthService;
import com.selacafe.core_service.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MenuRepository menuRepository;
    private final AuthService authService;

    @Override
    public void create(ReviewReq request) {

        User user = authService.getCurrentUser();

        if (reviewRepository.existsByUserIdAndMenuId(
                user.getId(),
                request.getMenuId())) {

            throw new BadRequestException(
                    "You have already reviewed this menu");
        }

        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu not found"));

        Review review = Review.builder()
                .user(user)
                .menu(menu)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);
    }

    @Override
    public List<ReviewRes> getByMenu(Long menuId) {

        return reviewRepository.findByMenuId(menuId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ReviewRes> getMyReviews() {
        User user = authService.getCurrentUser();
        return reviewRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ReviewRes update(Long id, ReviewReq request) {
        User user = authService.getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    @Override
    public void delete(Long id) {
        User user = authService.getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    private ReviewRes mapToResponse(Review review) {

        return ReviewRes.builder()
                .id(review.getId())
                .menuId(review.getMenu().getId())
                .menuNameId(review.getMenu().getNameId())
                .menuNameEn(review.getMenu().getNameEn())
                .rating(review.getRating())
                .comment(review.getComment())
                .userName(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}