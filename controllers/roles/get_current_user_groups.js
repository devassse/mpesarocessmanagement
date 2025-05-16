const get_current_user_groups = async (req, res) => {
    let groups = await req.user.populate("groups")

    return res.status(200).json({
        groups: [...groups.groups.map((group) => {
            return {
                name: group.name,
                userPermissions: group.userPermissions,
                description: group.description
            }
        }
        )]
    })

}


module.exports = get_current_user_groups