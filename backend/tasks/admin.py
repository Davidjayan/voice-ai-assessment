from django.contrib import admin
from .models import Task, TaskComment


class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'project__organization']
    search_fields = ['title', 'description']
    inlines = [TaskCommentInline]


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_name', 'created_at']
    list_filter = ['author_name']
    search_fields = ['content']
