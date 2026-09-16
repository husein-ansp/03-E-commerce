from django.urls import path

from . import views


urlpatterns = [
    path("", views.home, name="home"),
    path("products/", views.products, name="products"),
    path(
        "products/<slug:slug>/",
        views.product_detail,
        name="product_detail"
    ),
    path("cart/", views.cart, name="cart"),
    path("wishlist/", views.wishlist, name="wishlist"),
    path("checkout/", views.checkout, name="checkout"),
    path("orders/", views.orders, name="orders"),
    path("profile/", views.profile, name="profile"),
    path("login/", views.login_view, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout_view, name="logout"),
]