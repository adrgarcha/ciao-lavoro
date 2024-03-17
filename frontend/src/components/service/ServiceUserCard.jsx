import { useEffect, useState } from "react";

export default function ServiceUserCard({ service }) {

  const [profession, setProfession] = useState("");

  useEffect(() => {
    if (service.profession === 1) {
      setProfession("Lavandero");
    } else if (service.profession === 2) {
      setProfession("Celador");
    } else {
      setProfession("Albañil");
    }

  }, [service.profession]);

  //console.log(user)
  return (
    <div className="w-80 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
      <a href="#">
        <img src="https://images.unsplash.com/photo-1646753522408-077ef9839300?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NjZ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
                   className="h-80 w-80 object-cover rounded-t-xl" />
        <div className="px-4 py-3 w-72">
          
          <h2 className="text-2xl font-semibold mb-4"><strong></strong> {profession}</h2>
          <p className="mb-2 mt-4"><strong>Ciudad:</strong> {service.city}</p>
          <p className="mb-2">
            <strong>Experiencia:</strong> {service.experience} {service.experience > 1 ? "años" : "año"}
          </p>
          
        </div>
      </a>
    </div>
  );
}
