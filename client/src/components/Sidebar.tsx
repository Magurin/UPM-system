import React from "react";
import userIcon       from "../assets/user_icon.svg";
import droneIcon      from "../assets/drone_icon.svg";
import documentIcon   from "../assets/document_icon.svg";

interface Props {
  onProfileClick:        () => void;
  onDronesClick:         () => void;
  onFlightRequestsClick: () => void;
}

export function Sidebar({
  onProfileClick,
  onDronesClick,
  onFlightRequestsClick,
}: Props) {
  return (
    <aside className="sidebar">
      <ul className="sidebar__list">
        {/* Профиль */}
        <li className="sidebar__item" onClick={onProfileClick}>
          <img src={userIcon} alt="" className="sidebar__icon" />
          <span>Профиль</span>
        </li>

        {/* Дроны */}
        <li className="sidebar__item" onClick={onDronesClick}>
          <img src={droneIcon} alt="" className="sidebar__icon" />
          <span>Мои дроны</span>
        </li>

        {/* Заявки */}
        <li className="sidebar__item" onClick={onFlightRequestsClick}>
          <img src={documentIcon} alt="" className="sidebar__icon" />
          <span>Заявки</span>
        </li>
      </ul>
    </aside>
  );
}