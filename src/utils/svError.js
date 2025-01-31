export const iSvError = (res, error ) => {
    console.log(error)
    res.status(500).json({status: "error", error:`Internal Server Error`})
}