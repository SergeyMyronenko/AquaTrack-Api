import { startOfMonth, endOfMonth } from "date-fns";

import { Water } from "../models/water.js";
import HttpError from "../helpers/HttpError.js";

export const createWater = async (req, res, next) => {
  try {
    const { date, amount } = req.body;
    const owner = req.user._id;
    const water = await Water.create({
      date,
      amount,
      owner,
    });
    res.status(201).json(water);
  } catch (error) {
    next(error);
  }
};

export const deleteWater = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const result = await Water.findOneAndDelete({ _id: id, owner });
    if (!result) throw new HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateWater = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, amount } = req.body;
    const owner = req.user._id;
    const result = await Water.findByIdAndUpdate(
      id,
      { date, amount, owner },
      { new: true }
    );
    if (!result) throw new HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const getDayWater = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const dateParam = new Date(+req.params.date);
    const userTimezoneOffset = req.user.timezoneOffset || 0;

    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0 - userTimezoneOffset / 60, 0, 0, 0);

    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23 - userTimezoneOffset / 60, 59, 59, 999);

    const utcStart = startOfDay.getTime();
    const utcEnd = endOfDay.getTime();

    const foundWaterDayData = await Water.find({
      owner,
      date: {
        $gte: utcStart,
        $lt: utcEnd,
      },
    });

    if (!foundWaterDayData || foundWaterDayData.length === 0) {
      throw new HttpError(404, "Info for this day not found");
    }

    const totalDayWater = foundWaterDayData.reduce(
      (acc, item) => acc + item.amount,
      0
    );

    res.status(200).json({
      date: dateParam,
      totalDayWater,
      WaterData: foundWaterDayData,
      owner,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthWater = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const dateParam = new Date(+req.params.date);
    const userTimezoneOffset = req.user.timezoneOffset || 0;
    const startOfMonthDate = startOfMonth(dateParam);
    const endOfMonthDate = endOfMonth(dateParam);

    const startOfDay = new Date(startOfMonthDate);
    startOfDay.setHours(0 - userTimezoneOffset / 60, 0, 0, 0);

    const endOfDay = new Date(endOfMonthDate);
    endOfDay.setHours(23 - userTimezoneOffset / 60, 59, 59, 999);

    const utcStartTime = startOfDay.getTime();
    const utcEndTime = endOfDay.getTime();

    const foundWaterMonthData = await Water.find({
      owner,
      date: {
        $gte: utcStartTime,
        $lt: utcEndTime,
      },
    });

    const aggregatedMonthlyData = foundWaterMonthData.reduce((acc, item) => {
      const date = new Date(item.date);
      const dayOFMotnh = date.getDate();

      if (!acc[dayOFMotnh]) {
        acc[dayOFMotnh] = {
          dateParam: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
          totalDayWater: 0,
        };
      }
      acc[dayOFMotnh].totalDayWater += item.amount;

      return acc;
    }, {});

    const result = Object.values(aggregatedMonthlyData);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
