import Category from "../../models/category.model.js";
import Event from "../../models/event.model.js";
import Vendor from "../../models/vendor.model.js";

export const findCategoryByName = async (name) => {
  return await Category.findOne({
    name,
    isDeleted: false,
  });
};

export const createCategory = async (data) => {
  return await Category.create(data);
};

export const getAllCategories = async (
  filter = {},
  sort = { createdAt: -1 },
  skip = 0,
  limit = 0,
  sortBy = "newest"
) => {
  try {
    // 1. Aggregate event counts and vendorIds grouped by category
    const eventStats = await Event.aggregate([
      {
        $match: {
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          vendorIds: { $addToSet: "$vendorId" }
        }
      }
    ]);

    const eventStatsMap = new Map();
    eventStats.forEach((stat) => {
      if (stat._id) {
        eventStatsMap.set(String(stat._id), stat);
        eventStatsMap.set(String(stat._id).toLowerCase(), stat);
      }
    });

    // 2. Aggregate vendors by their registered eventCategory
    const vendorCategoryStats = await Vendor.aggregate([
      {
        $match: {
          isBlocked: { $ne: true },
          eventCategory: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: { $toLower: "$eventCategory" },
          vendorIds: { $addToSet: "$_id" }
        }
      }
    ]);

    const vendorStatsMap = new Map();
    vendorCategoryStats.forEach((stat) => {
      if (stat._id) {
        vendorStatsMap.set(String(stat._id).trim().toLowerCase(), stat.vendorIds);
      }
    });

    // Helper to enrich a category document
    const enrichCategory = (catDoc, allVendorMap) => {
      const cat = catDoc.toObject ? catDoc.toObject() : { ...catDoc };
      const catIdStr = String(cat._id);
      const catNameLower = (cat.name || "").toLowerCase().trim();

      const evStat =
        eventStatsMap.get(catIdStr) ||
        eventStatsMap.get(catNameLower) ||
        eventStatsMap.get(cat.name) ||
        { count: 0, vendorIds: [] };

      const eventCount = evStat.count || 0;
      const fromEventVendorIds = (evStat.vendorIds || []).map((id) => String(id));
      const fromProfileVendorIds = (vendorStatsMap.get(catNameLower) || []).map((id) => String(id));

      const combinedVendorIds = Array.from(new Set([...fromEventVendorIds, ...fromProfileVendorIds]));
      const vendorCount = combinedVendorIds.length;

      const avatars = [];
      if (allVendorMap) {
        for (const vId of combinedVendorIds) {
          const v = allVendorMap.get(vId);
          if (v && v.profilePicture?.fileUrl) {
            avatars.push(v.profilePicture.fileUrl);
          }
          if (avatars.length >= 3) break;
        }
      }

      return {
        ...cat,
        events: eventCount,
        eventCount: eventCount,
        vendors: vendorCount,
        vendorCount: vendorCount,
        avatars: avatars
      };
    };

    // If sorting by most-used, rank all matching categories by their event count
    if (sortBy === "most-used") {
      const allCategories = await Category.find({ ...filter, isDeleted: false });

      const allVendorIdsSet = new Set();
      eventStats.forEach((s) => (s.vendorIds || []).forEach((id) => allVendorIdsSet.add(String(id))));
      vendorCategoryStats.forEach((s) => (s.vendorIds || []).forEach((id) => allVendorIdsSet.add(String(id))));

      const vendorsList = await Vendor.find(
        { _id: { $in: Array.from(allVendorIdsSet) } },
        { profilePicture: 1 }
      );
      const allVendorMap = new Map();
      vendorsList.forEach((v) => allVendorMap.set(String(v._id), v));

      let enriched = allCategories.map((c) => enrichCategory(c, allVendorMap));
      enriched.sort((a, b) => (b.events - a.events) || (new Date(b.createdAt) - new Date(a.createdAt)));

      const total = enriched.length;
      const paginated = limit > 0 ? enriched.slice(skip, skip + limit) : enriched;

      return { categories: paginated, total };
    }

    // Standard query with pagination
    let query = Category.find({ ...filter, isDeleted: false }).sort(sort);
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    const categories = await query;
    const total = await Category.countDocuments({ ...filter, isDeleted: false });

    const pageVendorIdsSet = new Set();
    categories.forEach((cat) => {
      const catIdStr = String(cat._id);
      const catNameLower = (cat.name || "").toLowerCase().trim();
      const evStat = eventStatsMap.get(catIdStr) || eventStatsMap.get(catNameLower);
      if (evStat && evStat.vendorIds) {
        evStat.vendorIds.forEach((id) => pageVendorIdsSet.add(String(id)));
      }
      const profileVendors = vendorStatsMap.get(catNameLower);
      if (profileVendors) {
        profileVendors.forEach((id) => pageVendorIdsSet.add(String(id)));
      }
    });

    const vendorsList = await Vendor.find(
      { _id: { $in: Array.from(pageVendorIdsSet) } },
      { profilePicture: 1 }
    );
    const allVendorMap = new Map();
    vendorsList.forEach((v) => allVendorMap.set(String(v._id), v));

    const enrichedCategories = categories.map((cat) => enrichCategory(cat, allVendorMap));

    return { categories: enrichedCategories, total };
  } catch (error) {
    console.error("Error enriching categories:", error);
    // Fallback to basic categories if aggregation fails
    let query = Category.find({ ...filter, isDeleted: false }).sort(sort);
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    const categories = await query;
    const total = await Category.countDocuments({ ...filter, isDeleted: false });
    const fallbackCategories = categories.map((cat) => {
      const c = cat.toObject ? cat.toObject() : { ...cat };
      return { ...c, events: 0, eventCount: 0, vendors: 0, vendorCount: 0, avatars: [] };
    });
    return { categories: fallbackCategories, total };
  }
};


export const  getCategoryById = async(id) =>{
  return Category.findOne({
    _id : id,
    isDeleted : false
  })
}

export const saveCategory  =  async(category) =>{
  return await category.save()
}
