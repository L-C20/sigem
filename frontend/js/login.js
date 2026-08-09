const API_BASE_URL = "https://sigem-backend.onrender.com";


const email =
document.getElementById("email");


const password =
document.getElementById("password");


const btnIngresar =
document.getElementById("btnIngresar");


const mensaje =
document.getElementById("mensaje");



btnIngresar.addEventListener(
    "click",
    async()=>{


        try{


            const respuesta =
            await fetch(
                `${API_BASE_URL}/auth/login`,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        email:email.value,

                        password:password.value

                    })

                }
            );



            const datos =
            await respuesta.json();



            if(!respuesta.ok){

                throw new Error(
                    datos.error
                );

            }



            localStorage.setItem(
                "token",
                datos.token
            );


            localStorage.setItem(
                "usuario",
                JSON.stringify(datos.usuario)
            );



            window.location.href =
            "index.html";


        }
        catch(error){


            mensaje.textContent =
            error.message;


        }


    }
);