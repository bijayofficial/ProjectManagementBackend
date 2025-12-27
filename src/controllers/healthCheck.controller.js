import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
/*

const healthCheck = (req, res, next) => {
    try {
        res.status(200).json(
            new ApiResponse(200, { message: "Server is up and running." })
        )
    } catch (error) {
        next(error)
        res.status(404).json(
            new ApiError(404, { message: "Server start failed!" })
        )
    }
}
// avoid using too many try catch
// use  async handler
*/

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Server is up and running." })
    )
})

export { healthCheck };


