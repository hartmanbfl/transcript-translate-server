import { AppThemingData } from "../entity/AppThemingData.entity.js";

export const addLogoToDb = (imageBase64: string) => {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const themingData = new AppThemingData();
//tbd    themingData.logo = imageBuffer;
}