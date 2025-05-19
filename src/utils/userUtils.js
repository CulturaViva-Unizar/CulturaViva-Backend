function createUserDto(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        admin: user.admin,
        type: user.userType,
    };
}

module.exports = { createUserDto };
