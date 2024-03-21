    import { useEffect, useState } from "react";
    import ServiceCard from "./ServiceCard";
    import { getServiceByCityAndProfession } from "../../api/Service.api";

    export default function Services() {
        const [city, setCity] = useState('');
        const [profession, setProfession] = useState('');
        const [services, setServices] = useState([]);

        useEffect(() => {
            const getServices = async () => {
                try {
                    const res = await getServiceByCityAndProfession(city, profession);
                    if (res.status === 200) {
                        const data = await res.json();
                        setServices(data);
                    } else {
                        alert('Error al cargar los servicios');
                    }
                } catch (error) {
                    alert('Error al cargar los servicios');
                }
            };

            // Usado Copilot. Es para borrar algun timeout que se haya creado previamente
            let timeoutId = null;

            // Usado Copilot. Se establece el nuevo temporizador
            const handleTyping = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    getServices();
                }, 1000);
            };

            handleTyping();

            return () => clearTimeout(timeoutId);
        }, [city, profession]);

        return (
            <div>
                <section>
                    <h1 className="text-4xl font-semibold text-center my-10">Encuentra el servicio que necesitas</h1>
                </section>
                <section>
                    <form className="flex justify-center gap-2 my-4">
                        <input type="text" placeholder="Ciudad" className="w-96 pl-2 border rounded-lg py-2 font-semibold" value={city} onChange={(e) => setCity(e.target.value)} />
                        <select name="status" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-96 pl-2 border rounded-lg py-2 bg-orange-200 font-semibold">
                            <option value=""> Profesion </option>
                            <option value="1">Lavandero</option>
                            <option value="2">Celador</option>
                            <option value="3">Albañil</option>
                        </select>
                    </form>
                </section>

                <section className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">

                    {services.filter(service => service.is_active).map(service => (
                        <ServiceCard key={service.id} service={service} />
                        
                    ))}
                </section>
            </div>
        )
    }