# CRM Backend Checklist

## ✅ Зроблено

- Логін / logout / refresh токенів
- Default admin (admin@gmail.com / admin)
- Дві ролі: admin і manager
- Створення менеджера адміном (POST /users)
- Активація менеджера + генерація токена 30хв (POST /auth/activate/:id)
- Встановлення пароля (POST /auth/set-password)
- Recovery password (POST /auth/recovery/:id)
- Ban / Unban менеджера
- last_login оновлюється при логіні
- Список заявок з пагінацією 25шт, сортуванням, пошуком
- Список менеджерів з пагінацією
- Оновлення заявки з перевіркою прав
- Автозапис manager і status: In work при першому оновленні/коментарі
- Коментарі до заявок (POST /orders/:id/comments)
- Валідація полів заявки (status, course, course_type, course_format)
- Загальна статистика по статусах (GET /orders/statistic)
- Статистика конкретного менеджера (GET /users/:id/statistic)
- Моделі: order, user, token, comment, group

## ❌ Не зроблено

1. **Групи — є тільки модель**
   Немає: репозиторію, сервісу, контролера, роутера для:
   - GET /groups — список груп
   - POST /groups — створення групи (унікальна назва)

2. **Коментарі не повертаються з заявкою**
   GET /orders/:id не повертає коментарі.
   Потрібно в getOrderById додати підвантаження коментарів через commentRepository.

3. **Фільтрація заявок — неповна**
   GET /orders підтримує тільки search. ТЗ вимагає фільтри по:
   - course, course_format, course_type, status, group
   - age (діапазон)
   - created_at (діапазон дат)
   - my — тільки мої заявки (чекбокс)

4. **Excel експорт**
   GET /orders/excel — формує файл по поточних фільтрах.
   Потрібна бібліотека exceljs або xlsx.

5. **console.log в production коді**
   - backend/src/middleware/role.middleware.ts:9
   - backend/src/services/token.service.ts:63

6. **Пагінація менеджерів — сортування**
   ТЗ: нові менеджери зверху. Потрібно додати { createdAt: -1 } в getAllUsers.

## Пріоритет
1 (групи) → 2 (коментарі з заявкою) → 3 (фільтрація) → 4 (Excel) → 5, 6 (дрібниці)
