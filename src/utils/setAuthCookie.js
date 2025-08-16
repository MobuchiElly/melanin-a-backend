const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        secure: false,
        httpOnly: true,
        sameSite: "None",
        expires: new Date(Date.now() + 3600000),
    });
};

module.exports = setAuthCookie;