// ===============================
// AUTENTICACION
// ===============================

const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;




// ===============================
// VERIFICAR TOKEN
// ===============================

// Lee el encabezado Authorization y deja los datos
// del usuario disponibles en req.usuario

function verificarToken(req, res, next){


    const encabezado =
    req.headers.authorization || "";


    const token =
    encabezado.startsWith("Bearer ")
        ? encabezado.slice(7)
        : null;


    if(!token){


        return res.status(401).json({
            error:"Sesión no iniciada"
        });


    }


    try{


        req.usuario = jwt.verify(token, SECRET);


        next();


    }
    catch(error){


        return res.status(401).json({
            error:"Sesión vencida"
        });


    }


}




// ===============================
// PERMITIR ROLES
// ===============================

// Deja pasar solo a los roles indicados.
// Todavia no se usa: los roles reales se cargan
// en la etapa 2, recien ahi se enchufa.

function permitirRoles(...roles){


    return (req, res, next)=>{


        if(!roles.includes(req.usuario.rol)){


            return res.status(403).json({
                error:"No tenés permiso para esta sección"
            });


        }


        next();


    };


}




module.exports = {
    verificarToken,
    permitirRoles
};
