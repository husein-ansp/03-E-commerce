from django.contrib import admin

from .models import (
    Category,
    Product,
    Wishlist,
    Order,
    OrderItem,
    Review,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {
        "slug": ("name",)
    }


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "rating",
        "is_featured",
        "is_sale",
    )
    list_filter = (
        "category",
        "is_featured",
        "is_sale",
    )
    search_fields = (
        "name",
        "description",
    )


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "product",
        "created_at",
    )
    search_fields = (
        "user__username",
        "product__name",
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total",
        "payment_method",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "payment_method",
    )
    search_fields = (
        "user__username",
        "email",
        "phone",
    )
    inlines = [OrderItemInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "user",
        "rating",
        "created_at",
    )
    list_filter = ("rating",)
    search_fields = (
        "product__name",
        "user__username",
    )