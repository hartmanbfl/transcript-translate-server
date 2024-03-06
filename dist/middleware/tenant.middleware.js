export const tenantCheck = (tenantId) => {
    return async (req, res, next) => {
        const jwt = req.token;
        //console.log(`Authorizing: userId-> ${jwt.id}, role-> ${jwt.role}, tenantId-> ${jwt.tenantId}`);
        const allowedTenant = jwt.tenantId;
        if (allowedTenant == null || allowedTenant != tenantId) {
            return res.status(403).json({ message: "Forbidden to access this Tenant" });
        }
        next();
    };
};
