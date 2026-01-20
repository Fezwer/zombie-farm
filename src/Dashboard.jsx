import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onTelegramAuth as apiOnTelegramAuth } from "./request"; // путь подставьте свой

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Глобальная обёртка: виджет вызовет window.onTelegramAuth(user)
    window.onTelegramAuth = async function (user) {
      try {
        // Можно показать loader/disable кнопки здесь
        const res = await apiOnTelegramAuth(user);
        if (res.ok) {
          // Если на странице в query есть redirect — вернём туда, иначе в корень
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get("redirect");
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            // SPA-редирект: добавляем ?start=Game
            navigate("/?start=Game", { replace: true });
            // или если хотите полный reload:
            // window.location.href = "/?start=Game";
          }
        } else {
          // Обработка ошибки от сервера — показать сообщение пользователю
          console.error("Telegram auth failed", res);
          alert("Не удалось войти через Telegram: " + (res.error?.message || res.status));
        }
      } catch (e) {
        console.error("onTelegramAuth wrapper error", e);
        alert("Ошибка при обработке входа через Telegram.");
      }
    };

    // Динамически добавим скрипт Telegram-виджета
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    // Параметры для виджета можно задать через data-атрибуты
    script.setAttribute("data-telegram-login", "hzfarm_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    // При необходимости добавьте data-userpic="false" и т.д.
    const container = document.getElementById("telegram-widget-container");
    if (container) container.appendChild(script);

    return () => {
      // cleanup: удалить скрипт и глобальную функцию
      if (container) {
        while (container.firstChild) container.removeChild(container.firstChild);
      }
      try {
        delete window.onTelegramAuth;
      } catch (_) {
        window.onTelegramAuth = undefined;
      }
    };
  }, [navigate]);

  return (
    <div className="dashboard-root">
      <div className="card">
        <div className="card-header">
          <h2 className="card-subtitle">log in or sign up</h2>
          <span className="close-x" onClick={() => navigate(-1)}>x</span>
        </div>
        <h3 className="brand">HZF</h3>

        {/* Контейнер для Telegram-виджета */}
        <div id="telegram-widget-container"></div>
      </div>
    </div>
  );
}