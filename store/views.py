from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .models import Category, Product, Review, Wishlist


def home(request):
    featured_products = Product.objects.filter(
        is_active=True,
        is_featured=True
    ).select_related("category")[:8]

    categories = Category.objects.filter(
        is_active=True
    )[:8]

    latest_products = Product.objects.filter(
        is_active=True
    ).select_related("category")[:8]

    context = {
        "featured_products": featured_products,
        "latest_products": latest_products,
        "categories": categories,
    }

    return render(request, "store/home.html", context)


def products(request):
    product_list = Product.objects.filter(
        is_active=True
    ).select_related("category")

    query = request.GET.get("q", "").strip()
    category_slug = request.GET.get("category", "").strip()
    sort = request.GET.get("sort", "").strip()

    if query:
        product_list = product_list.filter(
            Q(name__icontains=query)
            | Q(description__icontains=query)
            | Q(brand__icontains=query)
        )

    if category_slug:
        product_list = product_list.filter(
            category__slug=category_slug
        )

    if sort == "price-low":
        product_list = product_list.order_by("price")
    elif sort == "price-high":
        product_list = product_list.order_by("-price")
    elif sort == "rating":
        product_list = product_list.order_by("-rating")
    elif sort == "newest":
        product_list = product_list.order_by("-created_at")

    categories = Category.objects.filter(is_active=True)

    context = {
        "products": product_list,
        "categories": categories,
        "query": query,
        "selected_category": category_slug,
        "selected_sort": sort,
    }

    return render(request, "store/products.html", context)


def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related("category"),
        slug=slug,
        is_active=True
    )

    reviews = Review.objects.filter(
        product=product,
        is_approved=True
    ).select_related("user")

    related_products = Product.objects.filter(
        category=product.category,
        is_active=True
    ).exclude(
        id=product.id
    )[:4]

    context = {
        "product": product,
        "reviews": reviews,
        "related_products": related_products,
    }

    return render(request, "store/product_detail.html", context)


def cart(request):
    return render(request, "store/cart.html")


@login_required
def wishlist(request):
    wishlist_items = Wishlist.objects.filter(
        user=request.user
    ).select_related("product")

    return render(
        request,
        "store/wishlist.html",
        {"wishlist_items": wishlist_items}
    )


@login_required
def orders(request):
    user_orders = request.user.orders.prefetch_related("items")

    return render(
        request,
        "store/orders.html",
        {"orders": user_orders}
    )


@login_required
def profile(request):
    return render(request, "store/profile.html")


def checkout(request):
    return render(request, "store/checkout.html")


def login_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = User.objects.filter(
            Q(username=username) | Q(email=username)
        ).first()

        if user and user.check_password(password):
            login(request, user)
            return redirect("home")

        messages.error(request, "Invalid username, email, or password.")

    return render(request, "store/login.html")


def register(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")
        confirm_password = request.POST.get("confirm_password", "")

        if not username or not email or not password:
            messages.error(request, "Please fill in all required fields.")
            return render(request, "store/register.html")

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, "store/register.html")

        if User.objects.filter(username=username).exists():
            messages.error(request, "This username is already taken.")
            return render(request, "store/register.html")

        if User.objects.filter(email=email).exists():
            messages.error(request, "An account with this email already exists.")
            return render(request, "store/register.html")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        login(request, user)

        return redirect("home")

    return render(request, "store/register.html")


def logout_view(request):
    logout(request)
    return redirect("home")