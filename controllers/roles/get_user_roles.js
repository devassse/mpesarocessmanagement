// BASIC

const get_current_user_roles = async ( req, res  ) => {
    return res.status(200).json({roles: req.user.roles})
}


module.exports = get_current_user_roles