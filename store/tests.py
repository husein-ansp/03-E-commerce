from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import Category, Product


class CategoryModelTest(TestCase):
    def test_category_creation(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )

        self.assertEqual(str(category), "Electronics")


class ProductModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )

    def test_product_creation(self):
        product = Product.objects.create(
            category=self.category,
            name="Wireless Headphones",
            slug="wireless-headphones",
            description="A wireless headphone.",
            price=99.99,
            stock=10
        )

        self.assertEqual(str(product), "Wireless Headphones")
        self.assertTrue(product.is_in_stock)

    def test_product_without_stock(self):
        product = Product.objects.create(
            category=self.category,
            name="Keyboard",
            slug="keyboard",
            description="A mechanical keyboard.",
            price=79.99,
            stock=0
        )

        self.assertFalse(product.is_in_stock)


class HomeViewTest(TestCase):
    def test_home_page(self):
        response = self.client.get(reverse("home"))

        self.assertEqual(response.status_code, 200)


class RegisterTest(TestCase):
    def test_user_creation(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword123"
        )

        self.assertTrue(
            user.check_password("testpassword123")
        )