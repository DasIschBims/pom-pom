export const getAccountRegion = (UID: string) => {
    const regionNum = UID.slice(0, 1);

    switch (regionNum) {
        case "9":
            return "prod_official_cht";
        case "8":
            return "prod_official_asia";
        case "7":
            return "prod_official_eur";
        case "6":
            return "prod_official_usa";
        default:
            return false;
    }
};