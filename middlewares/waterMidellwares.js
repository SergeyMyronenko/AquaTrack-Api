import HttpError from "../helpers/HttpError.js";

export const WaterDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const startDate = new Date("2024-01-01").getTime();
    const unixDay = 86400000;

    const currentDate = new Date();
    const unixCurrentDate = currentDate.getTime();

    if (isNaN(+date) || !Number.isInteger(+date))
      throw HttpError(400, "Invalid date format");

    if (+date < startDate)
      throw HttpError(400, "Date must start from 2024/01/01");

    if (+date > unixCurrentDate + unixDay)
      throw HttpError(400, "Date from future");
    next();
  } catch (error) {
    next(error);
  }
};
