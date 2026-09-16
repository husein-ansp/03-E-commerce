from django import forms
from django.contrib.auth.models import User

from .models import Review


class RegisterForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "placeholder": "Password",
                "class": "form-control",
            }
        )
    )

    confirm_password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "placeholder": "Confirm password",
                "class": "form-control",
            }
        )
    )

    class Meta:
        model = User
        fields = ["username", "email"]

        widgets = {
            "username": forms.TextInput(
                attrs={
                    "placeholder": "Username",
                    "class": "form-control",
                    "autocomplete": "username",
                }
            ),
            "email": forms.EmailInput(
                attrs={
                    "placeholder": "Email address",
                    "class": "form-control",
                    "autocomplete": "email",
                }
            ),
        }

    def clean_username(self):
        username = self.cleaned_data["username"].strip()

        if User.objects.filter(username=username).exists():
            raise forms.ValidationError(
                "This username is already taken."
            )

        return username

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(
                "An account with this email already exists."
            )

        return email

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            self.add_error(
                "confirm_password",
                "Passwords do not match."
            )

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)

        user.set_password(self.cleaned_data["password"])

        if commit:
            user.save()

        return user


class LoginForm(forms.Form):
    username = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "placeholder": "Username or email",
                "class": "form-control",
                "autocomplete": "username",
            }
        )
    )

    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "placeholder": "Password",
                "class": "form-control",
                "autocomplete": "current-password",
            }
        )
    )

    remember_me = forms.BooleanField(
        required=False
    )


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = [
            "rating",
            "title",
            "comment",
        ]

        widgets = {
            "rating": forms.Select(
                choices=[
                    (5, "5 - Excellent"),
                    (4, "4 - Very good"),
                    (3, "3 - Good"),
                    (2, "2 - Fair"),
                    (1, "1 - Poor"),
                ],
                attrs={
                    "class": "form-select",
                }
            ),
            "title": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Review title",
                }
            ),
            "comment": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "placeholder": "Write your review...",
                    "rows": 5,
                }
            ),
        }