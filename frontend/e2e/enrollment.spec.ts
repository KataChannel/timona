import { test, expect } from '@playwright/test';

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should enroll in a free course', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to courses
    await page.waitForURL('/courses');
    
    // Find and click on a free course
    await page.click('text=Free Course');
    
    // Wait for course detail page
    await expect(page.locator('h1')).toContainText('Free Course');
    
    // Click enroll button
    await page.click('button:has-text("Enroll Now")');
    
    // Wait for enrollment confirmation
    await expect(page.locator('text=Successfully enrolled')).toBeVisible();
    
    // Verify redirect to course player or my learning
    await expect(page).toHaveURL(/\/courses\/.*\/learn|\/my-learning/);
  });

  test('should show checkout for paid courses', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to paid course
    await page.goto('/courses');
    await page.click('text=Paid Course');
    
    // Click enroll button
    await page.click('button:has-text("Buy Now")');
    
    // Should redirect to checkout
    await expect(page).toHaveURL(/\/checkout\/.*/);
    
    // Verify checkout page elements
    await expect(page.locator('h1')).toContainText('Checkout');
    await expect(page.locator('text=$99.99')).toBeVisible();
  });

  test('should require login for enrollment', async ({ page }) => {
    // Navigate to course without login
    await page.goto('/courses/test-course');
    
    // Click enroll button
    await page.click('button:has-text("Enroll Now")');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display course in my learning after enrollment', async ({ page }) => {
    // Login and enroll (assuming already enrolled)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'alice.student@rausachcore.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to my learning
    await page.goto('/my-learning');
    
    // Verify enrolled courses are displayed
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible();
    
    // Verify progress bar is visible
    await expect(page.locator('[data-testid="progress-bar"]').first()).toBeVisible();
  });

  test('should start learning from course card', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'alice.student@rausachcore.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to my learning
    await page.goto('/my-learning');
    
    // Click "Continue Learning" button
    await page.click('button:has-text("Continue Learning")');
    
    // Should navigate to course player
    await expect(page).toHaveURL(/\/courses\/.*\/learn/);
    
    // Verify video player or lesson content is visible
    await expect(
      page.locator('video, [data-testid="lesson-content"]'),
    ).toBeVisible();
  });
});
