import { updateContractStatus } from "../../api/Contract.api";
import { useAuthContext } from "../auth/AuthContextProvider";

export function ContractCardClient({ contract }) {

    const { loggedUser } = useAuthContext();

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    function getStatusColor(estatus) {
        switch (estatus) {
            case "Negociacion":
                return "bg-sky-50";
            case "Aceptado":
                return "bg-green-50";
            case "En proceso":
                return "bg-yellow-50";
            case "Finalizado":
                return "bg-white";
            case "Cancelado":
                return "bg-rose-100";
            case "Pagado":
                return "bg-violet-100";
            default:
                return "";
        }
    }

    const updateStatus = async (contractId, statusNum, token) => {
        try {
            const response = await updateContractStatus(contractId, statusNum, token);
            if (response.ok) {
                alert('Estado actualizado correctamente');
                window.location.reload();
            } else {
                alert('Error al actualizar el estado. Por favor, intente de nuevo.');
            }
        } catch (error) {
            alert('Error al actualizar el estado. Por favor, intente de nuevo.');
        }
    };

    // Recordatorio de los estados con su NUM:
    // (1, "Negociacion"),
    // (2, "Aceptado"),
    // (3, "En proceso"),
    // (4, "Finalizado"),
    // (5, "Cancelado"),
    // (6, "Pagado")

    return (
        <a href="#">
            <div className={`max-w-md mx-auto my-2 border rounded-lg overflow-hidden p-6 ${getStatusColor(contract.estatus)}`}>
                <h2 className="text-2xl font-semibold text-center">Nombre del trabajador:</h2>
                <p className="mb-2 mt-1 text-2xl text-center"><strong>{contract.worker.username}</strong></p>
                <p className="mb-2"><strong>Fecha de inicio:</strong> {formatDate(contract.initial_date)}</p>
                <p className="mb-2"><strong>Fecha fin:</strong> {formatDate(contract.end_date)}</p>
                <p className={"mb-2"}><strong>Estado:</strong> {contract.estatus}</p>
                <p className="mb-2"><strong>Remuneración a recibir:</strong> {contract.cost}€</p>
                <p className="mb-2"><strong>Descripción del contrato:</strong> {contract.description}</p>

                <div className="flex justify-center">
                    {contract.estatus === "Aceptado" && (
                        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-4"
                            onClick={() => updateStatus(contract.id, 6, loggedUser.token)}>
                            Pagar
                        </button>
                    )}
                </div>
                <div className="flex justify-center items-center">
                    {contract.estatus === "En proceso" && (
                        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-4"
                            onClick={() => updateStatus(contract.id, 4, loggedUser.token)}>
                            Finalizar
                        </button>
                    )}
                </div>
            </div>
        </a>



    );
}
