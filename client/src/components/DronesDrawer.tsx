import { useState, useEffect, FormEvent } from "react";
import { Drawer } from "./Drawer";
import {
  listDrones,
  createDrone,
  deleteDrone,
  DroneInput,
} from "../api/drones";

interface Drone {
  id: number;
  brand: string;
  model: string;
  serial_number: string;
}

export function DronesDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // ─── Загрузка списка ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setIsAdding(false);
    listDrones().then(setDrones).catch(() => setDrones([]));
  }, [isOpen]);

  // ─── Создание ─────────────────────────────────────────────────────
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const data: DroneInput = { brand, model, serial_number: serial };

    try {
      await createDrone(data);
      setBrand("");
      setModel("");
      setSerial("");
      setDrones(await listDrones());
      setIsAdding(false);
    } catch {
      alert("Ошибка добавления дрона");
    }
  };

  // ─── Удаление ─────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить этот дрон?")) return;
    try {
      await deleteDrone(id);
      setDrones((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Не получилось удалить дрон");
    }
  };

  return (
    <Drawer title="Мои дроны" isOpen={isOpen} onClose={onClose}>
      {/* ─── Режим списка ─────────────────────────────────────────── */}
      {!isAdding && (
        <>
          {drones.length ? (
            <ul className="space-y-1">
              {drones.map((d) => (
                <li
                  key={d.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {/* данные */}
                  <div className="leading-tight">
                    <p className="font-semibold text-sm">
                      {d.brand} {d.model}
                    </p>
                    <p className="text-xs text-gray-600">
                      Серийный номер: {d.serial_number}
                    </p>
                  </div>

                  {/* кнопка удаления */}
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Удалить"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>У вас пока нет зарегистрированных дронов.</p>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-1 text-sm rounded"
          >
            Добавить
          </button>
        </>
      )}

      {/* ─── Режим формы добавления ──────────────────────────────── */}
      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-3">
          <h3 className="font-medium text-lg">Добавить дрон</h3>

          <input
            className="w-full border p-2 rounded"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Марка"
            required
          />
          <input
            className="w-full border p-2 rounded"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Модель"
            required
          />
          <input
            className="w-full border p-2 rounded"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Серийный номер"
            required
          />

          {/* две компактные кнопки */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 text-sm rounded"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 py-1 text-sm rounded"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </Drawer>
  );
}
