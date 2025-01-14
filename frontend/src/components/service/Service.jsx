import { useLoaderData, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { updateServiceRequest, getProfessionsList, promoteService, updatePromoteService, getUserCanReviewInService } from "../../api/Service.api"
import ServiceData from "./ServiceData"
import ServiceButton from "./ServiceButton"
import PencilIcon from "../icons/PencilIcon"
import CheckIcon from "../icons/CheckIcon"
import LinkButtonContract from "./LinkButtonContract"
import CrossIcon from "../icons/CrossIcon"
import { useAuthContext } from "../auth/AuthContextProvider"
import {
   checkIfEmpty,
   checkCityLength,
   checkExperienceNegative,
   errorMessages,
   checkExperienceYears,
   checkOnlyCharactersInText,
   checkIfPointsPositive,
   checkIfToManyPoints,
   checkNotStringPoints,
   checkIntegerPoints,
   checkIfPointsMoreThanMoney,
   getAge,
   checkfloatExperience,
} from "../../utils/validation"
import Jobs from "./Jobs"
import PromotionButton from "./PromotionButton"
import MegaphoneIcon from "../icons/MegaphoneIcon"
import WalletIcon from "../icons/WalletIcon"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEFAULT_USER_IMG =
   "https://images.unsplash.com/photo-1646753522408-077ef9839300?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NjZ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"

export default function ServiceDetails() {
   const service = useLoaderData()
   const { loggedUser } = useAuthContext()
   const [professions, setProfessions] = useState([])
   const [points, setPoints] = useState(0)
   const [canReview, setCanReview] = useState(false)
   const [isPromoted, setIsPromoted] = useState(false)
   const queryParams = new URLSearchParams(window.location.search)

   //Hecho con Copilot
   const hasPassedAMonth = promotionDate => {
      const currentDate = new Date()
      const promotionDateObj = new Date(promotionDate)
      const oneMonth = 1000 * 60 * 60 * 24 * 30
      return currentDate - promotionDateObj > oneMonth
   }

   useEffect(() => {
      const fetchProfessions = async () => {
         try {
            const response = await getProfessionsList(loggedUser.token)
            const data = await response.json()
            setProfessions(data.professions)
         } catch (error) {
            console.error("Failed to fetch professions", error)
         }
      }

      if (loggedUser && loggedUser.token) {
         fetchProfessions()
      }
      const fetchCanReview = async () => {
         try {
            const res = await getUserCanReviewInService(service.id, loggedUser.token)
            if (res.status === 200) {
               const data = await res.json()
               setCanReview(data)
            }
         } catch (error) {
            console.error("Failed to fetch if user can review this service", error)
         }
      }
      fetchCanReview()

      if (service.is_promoted) {
         const hasPassed = hasPassedAMonth(service.is_promoted)
         setIsPromoted(!hasPassed)
      } else {
         setIsPromoted(false)
      }
   }, [loggedUser, service.id, service.is_promoted])

   const updateServiceToPromote = async (serviceId, sessionId, points, token) => {
      try {
         const response = await updatePromoteService(serviceId, sessionId, points, token)
         if (response.ok && queryParams.get("session_id")) {
            setIsPromoted(true)
         } else {
            alert("Error al promocionar el servicio. Por favor, intente de nuevo.")
         }
      } catch (error) {
         alert("Error al promocionar el servicio. Por favor, intente de nuevo.")
      }
   }

   useEffect(() => {
      if (queryParams.get("session_id")) {
         const points = +queryParams.get("points")
         updateServiceToPromote(service.id, queryParams.get("session_id"), points, loggedUser.token)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const [isEditing, setIsEditing] = useState(false)
   const [city, setCity] = useState(service.city)
   const [profession, setProfession] = useState(service.profession)
   const [experience, setExperience] = useState(service.experience)
   const [isActive, setIsActive] = useState(service.is_active)
   const [isRequiredCityError, setIsRequiredCityError] = useState(false)
   const [isRequiredExperienceError, setIsRequiredExperienceError] = useState(false)
   const [isBigExperienceError, setIsBigExperienceError] = useState(false)
   const [isCityError, setIsCityError] = useState(false)
   const [isOnlyCharacters, setIsOnlyCharacters] = useState(false)
   const [isExperienceError, setIsExperienceError] = useState(false)
   const [isExperienceFloatError, setIsExperienceFloatError] = useState(false)
   const [tooManyPoints, setTooManyPoints] = useState(false)
   const [positivePoints, setPositivePoints] = useState(false)
   const [noMorePointsMoney, setNoMorePointsMoney] = useState(false)
   const [integerPoints, setIntegerPoints] = useState(false)
   const [notStringPoints, setNotStringPoints] = useState(false)

   const resetServiceData = () => {
      setCity(service.city)
      setProfession(service.profession)
      setExperience(service.experience)
      setIsActive(service.is_active)
      if (service.is_promoted) {
         const hasPassed = hasPassedAMonth(service.is_promoted)
         setIsPromoted(!hasPassed)
      } else {
         setIsPromoted(false)
      }
   }

   const updateService = async (serviceId, serviceData, token) => {
      try {
         const response = await updateServiceRequest(service.id, serviceData, token)
         if (response.ok) {
            alert("Servicio actualizado correctamente")
            setIsEditing(false)
            window.location.reload()
         } else {
            alert("Error al actualizar el servicio. Por favor, intente de nuevo.")
            resetServiceData()
         }
      } catch (error) {
         alert("Error al actualizar el servicio. Por favor, intente de nuevo.")
         resetServiceData()
      }
   }

   const resetErrors = () => {
      setIsRequiredCityError(false)
      setIsRequiredExperienceError(false)
      setIsCityError(false)
      setIsExperienceError(false)
      setIsBigExperienceError(false)
      setIsOnlyCharacters(false)
      setIsExperienceFloatError(false)
   }

   const resetPaymentErrors = () => {
      setPositivePoints(false)
      setTooManyPoints(false)
      setNoMorePointsMoney(false)
      setNotStringPoints(false)
      setIntegerPoints(false)
   }

   const handleEdit = async event => {
      event.preventDefault()

      if (checkIfEmpty(city)) {
         setIsRequiredCityError(true)
         return
      } else if (checkOnlyCharactersInText(city)) {
         resetErrors()
         setIsOnlyCharacters(true)
         return
      } else if (checkIfEmpty(experience.toString())) {
         resetErrors()
         setIsRequiredExperienceError(true)
         return
      } else if (checkExperienceNegative(experience)) {
         resetErrors()
         setIsExperienceError(true)
         return
      } else if (checkfloatExperience(Number(experience))) {
         resetErrors()
         setIsExperienceFloatError(true)
         return
      }else if (checkExperienceYears(experience, loggedUser.user.birth_date)) {
         resetErrors()
         setIsBigExperienceError(true)
         return
      } else if (checkCityLength(city)) {
         resetErrors()
         setIsCityError(true)
         return
      }
      resetErrors()
      setIsEditing(true)

      const serviceData = {
         id: service.id,
         profession: profession,
         city: city,
         experience: Number(experience),
         is_active: isActive,
         is_promoted: isPromoted,
         jobs: service.jobs,
         user: service.user,
      }

      if (window.confirm("¿Está seguro de guardar los cambios?")) {
         updateService(service.id, serviceData, loggedUser.token)
      }
   }

   const handleCancel = () => {
      resetServiceData()
      setIsEditing(false)
      resetErrors()
   }

   const handlePayment = async (serviceId, token, points1) => {
      const returnURL = window.location.href
      const money = 4.99
      if (checkIfToManyPoints(service.user.points, points1)) {
         setTooManyPoints(true)
         return
      } else if (checkIfPointsPositive(points1)) {
         resetPaymentErrors()
         setPositivePoints(true)
         return
      } else if (checkIfPointsMoreThanMoney(points1, money)) {
         resetPaymentErrors()
         setNoMorePointsMoney(true)
         return
      } else if (checkIntegerPoints(points1)) {
         resetPaymentErrors()
         setIntegerPoints(true)
         return
      } else if (checkNotStringPoints(points1)) {
         resetPaymentErrors()
         setNotStringPoints(true)
         return
      }
      resetPaymentErrors()

      try {
         const responseData = await promoteService(serviceId, token, returnURL, points1)
         const sessionUrl = responseData.sessionUrl
         if (sessionUrl) {
            window.open(sessionUrl, "_self")
         } else {
            alert("Error al obtener la URL de pago. Por favor, inténtelo de nuevo.")
         }
      } catch (error) {
         alert("Error al procesar la operación. Por favor, inténtelo de nuevo.")
      }
   }
   return (
      <div className="my-10 lg:mx-40 md:mx-10 mx-1">
         <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 justify-center items-center gap-y-10 my-10 lg:mx-10 md:mx-10 mx-1 bg-white border rounded-lg">
            {/* Imagen */}
            <section>
               <div className="lg:px-8 lg:py-8 md:px-8 md:py-4 p-1 w-65 flex flex-col items-center">
                  <img src={`${service.user.image}` ?? DEFAULT_USER_IMG} className="w-72 h-72 lg:w-96 lg:h-96 object-cover rounded-xl" />
               </div>
            </section>

            <section>
               {/*Datos*/}
               {isEditing ? (
                  <form onSubmit={handleEdit}>
                     <div className="border bg-white shadow-md rounded-xl lg:m-8 md:m-4 m-1">
                        <div className="flex flex-col justify-center gap-y-6 px-8 py-3">
                           <ServiceData
                              type={"text"}
                              formName={"username"}
                              labelText={"Usuario:"}
                              inputValue={service.user.username ?? "Pablo"}
                              isReadOnly={true}
                           />
                           <div>
                              <label htmlFor="profession" className="flex flex-col gap-x-4 text-1.7xl font-semibold">
                                 Profesión:{" "}
                              </label>
                              <select
                                 id="profession"
                                 name="profession"
                                 value={profession}
                                 disabled={!isEditing}
                                 onChange={event => setProfession(event.target.value)}
                                 className="pl-2 border rounded w-full md:w-94">
                                 <option>{profession}</option>
                                 {professions.map((prof, index) => (
                                    <option key={index} value={prof.name}>
                                       {prof.name}
                                    </option>
                                 ))}
                              </select>
                           </div>
                           <ServiceData
                              type={"text"}
                              formName={"city"}
                              labelText={"Ciudad:"}
                              inputValue={city}
                              isReadOnly={!isEditing}
                              onChange={event => setCity(event.target.value)}
                              isError={isRequiredCityError || isCityError || isOnlyCharacters}
                              errorMessage={
                                 (isRequiredCityError && errorMessages.required) ||
                                 (isCityError && errorMessages.cityLength) ||
                                 (isOnlyCharacters && errorMessages.onlyCharacters)
                              }
                           />
                           <ServiceData
                              type={"number"}
                              formName={"experience"}
                              labelText={"Experiencia(años):"}
                              inputValue={experience}
                              isError={isRequiredExperienceError || isExperienceError || isBigExperienceError || isExperienceFloatError}
                              errorMessage={
                                 (isRequiredExperienceError && errorMessages.required) ||
                                    (isExperienceError && errorMessages.experienceNotValid) ||
                                    (isBigExperienceError && ("El máximo de experiencia son "+ (getAge(loggedUser.user.birth_date) - 16) + " años. "+errorMessages.tooMuchExperience))||
                                    (isExperienceFloatError && errorMessages.floatExperience)
                              }
                              isReadOnly={!isEditing}
                              onChange={event => setExperience(event.target.value)}
                           />

                           <div className="grid grid-cols-2 gap-x-4 items-center w-full">
                              {loggedUser && loggedUser.user.username === service.user.username && (
                                 <p className="font-semibold text-right">
                                    <strong>¿Activo?: </strong>
                                    <input
                                       type="checkbox"
                                       checked={isActive}
                                       onChange={event => {
                                          setIsActive(event.target.checked)
                                       }}
                                       disabled={!isEditing}
                                    />
                                 </p>
                              )}
                           </div>
                           <div className="flex justify-center gap-x-4">
                              <ServiceButton type={"submit"} text={"Guardar cambios"} icon={<CheckIcon />} />
                              <ServiceButton type={"button"} text={"Cancelar"} icon={<CrossIcon />} onClick={handleCancel} />
                           </div>
                        </div>
                     </div>
                  </form>
               ) : (
                  <div className="border bg-white shadow-md rounded-xl lg:m-8 md:m-4 m-1">
                     <div className="flex flex-col justify-center gap-y-3 px-8 py-3">
                        <h2 className="text-4xl font-bold mb-5">Datos del servicio</h2>
                        <h3 className="text-2xl">
                           <strong>Usuario:</strong> {service.user.username}
                        </h3>
                        <h3 className="text-2xl">
                           <strong>Profesión:</strong> {service.profession}
                        </h3>
                        <h3 className="text-2xl">
                           <strong>Ciudad:</strong> {service.city}
                        </h3>
                        <h3 className="text-2xl">
                           <strong>Experiencia:</strong> {service.experience} años
                        </h3>
                        {loggedUser && loggedUser.user.username === service.user.username && (
                           <div>
                              <h3 className="text-2xl">¿Activo?: {service.is_active ? "Sí" : "No"}</h3>
                           </div>
                        )}
                        <div className="flex justify-center gap-x-4">
                           <div className="pt-4">
                              {loggedUser && loggedUser.user && loggedUser.user.username === service.user.username && (
                                 <ServiceButton type={"button"} text={"Editar servicio"} icon={<PencilIcon />} onClick={() => setIsEditing(true)} />
                              )}
                           </div>
                           {loggedUser && loggedUser.user.username === service.user.username && !isPromoted && (
                              <div className="pt-4">
                                 {service.user.points === 0 ? (
                                    <PromotionButton
                                       type={"button"}
                                       text={"Promocionar Servicio"}
                                       icon={<MegaphoneIcon />}
                                       onClick={() => handlePayment(service.id, loggedUser.token, Number(points))}
                                    />
                                 ) : (
                                    <Dialog>
                                       <DialogTrigger asChild>
                                          <PromotionButton type={"button"} text={"Promocionar Servicio"} icon={<MegaphoneIcon />} />
                                       </DialogTrigger>
                                       <DialogContent className="sm:max-w-[425px]">
                                          <DialogHeader>
                                             <DialogTitle>Promocionar tu servicio cuesta 4,99€ </DialogTitle>
                                             <DialogDescription>¿Cuantos puntos quieres usar para la promoción? </DialogDescription>
                                             <DialogDescription>100 pts = 1 €</DialogDescription>
                                             <DialogDescription>Los puntos descontarán dinero del precio final.</DialogDescription>
                                             <DialogDescription>
                                                {" "}
                                                <strong>Tus puntos:</strong> {service.user.points}
                                             </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid gap-4 py-4">
                                             <div className="grid grid-col-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
                                                <Label htmlFor="name" className="text-left">
                                                   Puntos
                                                </Label>
                                                <Input id="points" value={points} onChange={e => setPoints(e.target.value)} className="col-span-3" />
                                             </div>
                                             <DialogDescription>
                                                {(tooManyPoints || positivePoints || noMorePointsMoney || notStringPoints || integerPoints) && (
                                                   <div className="text-red-500">
                                                      {(tooManyPoints && errorMessages.tooManyPoints) ||
                                                         (positivePoints && errorMessages.positivePoints) ||
                                                         (noMorePointsMoney && errorMessages.noMorePointsMoney) ||
                                                         (notStringPoints && errorMessages.notCorrectPoitns) ||
                                                         (integerPoints && errorMessages.notIntegerPoints)}
                                                   </div>
                                                )}
                                             </DialogDescription>
                                             <DialogFooter>
                                                <PromotionButton
                                                   type={"submit"}
                                                   text={"Pagar promocion"}
                                                   icon={<WalletIcon />}
                                                   onClick={() => {
                                                      handlePayment(service.id, loggedUser.token, Number(points))
                                                   }}
                                                />
                                             </DialogFooter>
                                          </div>
                                       </DialogContent>
                                    </Dialog>
                                 )}
                              </div>
                           )}

                           {loggedUser && loggedUser.user.username !== service.user.username && (
                              <LinkButtonContract url={`/contracts/create?service_id=${service.id}`} title="Contratar" />
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </section>
         </div>
         <div>
            <section>
               {/*Datos*/}
               <div className="border bg-white shadow-md rounded-xl lg:m-8 md:m-4 m-1">
                  <Jobs />
               </div>
            </section>
         </div>
         <div>
            <section>
               {/*Comentarios */}
               <div className="border bg-white shadow-md rounded-xl lg:m-8 md:m-4 m-1">
                  <div className="flex flex-col gap-y-2 px-10 py-6">
                     <h2 className="text-3xl font-bold mb-4">Opiniones de otros usuarios:</h2>
                     {loggedUser && loggedUser.user.username !== service.user.username && (
                        <>
                           {!service.reviews.some(review => review.user.username === loggedUser.user.username) && (
                              <>
                                 {canReview === true ? (
                                    <Link to={`/review?service_id=${service.id}`}>
                                       <button className="bg-slate-300 rounded px-2 py-1 font-semibold flex">Añadir una nueva reseña</button>
                                    </Link>
                                 ) : null}
                              </>
                           )}
                        </>
                     )}
                     <div className="grid sm:grid-cols-1 lg:grid-cols-2">
                        {service.reviews.length > 0 ? (
                           service.reviews.map(review => (
                              <div key={review.id} className="w-90 border bg-white shadow-md rounded-xl m-8">
                                 <div className="flex flex-col justify-center px-4 py-6 sm:text-center">
                                    <div className="justify-between mb-6">
                                       <div className="flex flex-col">
                                          <label className="block text-lg font-medium mb-1">Nombre de usuario:</label>
                                          <div className="flex border p-2 rounded-md mb-4">{review.user.username}</div>
                                       </div>
                                       <div className="flex flex-col items-center">
                                          <div className="flex">
                                             {[1, 2, 3, 4, 5].map(value => (
                                                <span
                                                   key={value}
                                                   className={`text-4xl ${review.rating >= value ? "text-yellow-500" : "text-gray-300"}`}>
                                                   ★
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex flex-col w-full">
                                       <label className="block text-lg font-medium mb-1">Descripción:</label>
                                       <div className="border p-2 rounded-md sm:text-2xl">{review.description}</div>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="w-full text-center py-4">Aún no hay opiniones para este servicio.</div>
                        )}
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </div>
   )
}
