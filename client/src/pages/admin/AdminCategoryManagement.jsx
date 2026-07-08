import React, { useState, useEffect } from 'react';
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Search,
  Bell,
  Sidebar,
  Plus,
  Filter,
  ChevronDown,
  RefreshCw,
  Trash2,
  ArrowDownUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory
} from "../../services/admin.api";
import CreateCategoryModal from "../../components/admin/CreateCategoryModal";
import UpdateCategoryModal from "../../components/admin/UpdateCategoryModal";
import { getAllCategories } from '../../services/common.api';



function AdminCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [sortBy, setSortBy] = useState("newest"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const limit = 6; 

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const fetchCategories = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await getAllCategories({
        page,
        limit,
        search: searchQuery,
        status: statusFilter,
        sortBy
      });
      if (response.data && response.data.success) {
        setCategories(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalCategories(response.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 on filter/search change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCategories(1);
    }
  }, [searchQuery, statusFilter, sortBy]);

  // Fetch when page changes
  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

const handleCreateCategorySubmit = async (categoryData) => {
  const nameExists = categories.some(
    (cat) => cat.name.trim().toLowerCase() === categoryData.name.trim().toLowerCase()
  );
  if (nameExists) {
    toast.error("Category name must be unique!");
    throw new Error("Category name must be unique!");
  }

  try {
    const formData = new FormData();

    formData.append("name", categoryData.name);
    formData.append("description", categoryData.description);

    if (categoryData.icon) {
      formData.append("categoryIcon", categoryData.icon);
    }

    const response = await createCategory(formData);

    if (response.data?.success) {
      toast.success("Category created successfully!");
      fetchCategories();
    }
  } catch (error) {
    console.error("Failed to save category:", error);
    toast.error(
      error.response?.data?.message || "Failed to save category"
    );
    throw error;
  }
};

const handleEditCategory = async (categoryData) => {
  if (!selectedCategory) return;

  // Check if name is unique (excluding the category currently being edited, case-insensitive)
  const nameExists = categories.some(
    (cat) =>
      cat._id !== selectedCategory._id &&
      cat.name.trim().toLowerCase() === categoryData.name.trim().toLowerCase()
  );
  if (nameExists) {
    toast.error("Category name must be unique!");
    throw new Error("Category name must be unique!");
  }

  try {
    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("description", categoryData.description);

    if (categoryData.icon) {
      formData.append("categoryIcon", categoryData.icon);
    }

    const response = await updateCategory(selectedCategory._id, formData);

    if (response.data?.success) {
      toast.success("Category updated successfully!");
      fetchCategories();
    }
  } catch (error) {
    console.error("Failed to update category:", error);
    toast.error(
      error.response?.data?.message || "Failed to update category"
    );
    throw error;
  }
};

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleCategoryStatus(id);
      if (response.data && response.data.success) {
        toast.success("Category status updated successfully!");
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };


  const deleteCategoryHandler = async (id) => {
    try {
      const response = await deleteCategory(id);
      if (response.data && response.data.success) {
        toast.success("Category deleted successfully!");
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleDeleteCategory = (id) => {
  toast("Are you sure you want to delete this category?", {
    action: {
      label: "Delete",
      onClick: () => deleteCategoryHandler(id),
    },
    cancel: {
      label: "Cancel",
    },
    duration: 10000,
  });
};


  const displayedCategories = categories;

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
          <div className="flex items-center text-gray-400 text-sm">
            <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
            <span className="mx-2">&gt;</span>
            <span className="text-gray-200 font-medium">Categories</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0 scrollbar-hide">
          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Category & Event Type Management
              </h1>
              <p className="text-gray-400 text-sm">
                Control how vendors organize events on EventFlow
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-900/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0B0914] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Beautiful custom-styled select wrapper for Status Filter */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-[#0B0914] border border-gray-850 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:border-purple-500 w-full cursor-pointer transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Beautiful custom-styled select wrapper for Sorting */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#0B0914] border border-gray-850 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:border-purple-500 w-full cursor-pointer transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="most-used">Most Used</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={fetchCategories}
                className="p-2.5 bg-[#0B0914] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Content Grid */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-gray-400 text-sm">Loading categories...</p>
              </div>
            </div>
          ) : displayedCategories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-[#151221] border border-gray-800/80 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center mb-4 text-purple-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No categories found</h3>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search query or status filters to find what you are looking for."
                  : "Get started by adding your very first event category to the platform."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-900/20 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add First Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
              {displayedCategories.map((category) => {
                const categoryIconUrl = category.categoryIcon?.fileUrl;

                return (
                  <div key={category._id} className="bg-[#151221] border border-gray-800/80 rounded-2xl p-5 flex flex-col">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-purple-950/20 border border-purple-800/30">
                          {categoryIconUrl ? (
                            <img src={categoryIconUrl} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <Sparkles className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(category._id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                category.isActive
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/30"
                                  : "bg-red-950/40 text-red-400 border-red-800/50 hover:bg-red-900/30"
                              }`}
                              title="Click to toggle status"
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </button>
                            <span className="text-gray-500 text-[11px]">
                              Created {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Sub-container */}
                    <div className="bg-[#0B0914] rounded-xl p-4 flex justify-between items-center mb-4 border border-gray-800/50">
                      <div>
                        <p className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider">Total Events</p>
                        <p className="text-lg font-bold text-white">{category.events || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider">Vendors</p>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="flex -space-x-1.5">
                            {(category.avatars || []).map((avatar, i) => (
                              <img
                                key={i}
                                src={avatar}
                                alt="Vendor"
                                className="w-5.5 h-5.5 rounded-full border border-[#0B0914] object-cover"
                              />
                            ))}
                          </div>
                          <span className="bg-gray-800 text-gray-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            {category.vendors || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6 flex-1">
                      <p className="text-gray-500 text-[10px] mb-1.5 uppercase tracking-wider">Description</p>
                      <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-auto flex items-center gap-3">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="flex-1 bg-[#0B0914] hover:bg-purple-950/20 hover:text-purple-400 border border-gray-800/80 hover:border-purple-800/50 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Edit Category
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2.5 bg-[#0B0914] hover:bg-red-950/20 border border-gray-800/80 hover:border-red-800/50 text-red-500 rounded-xl transition-all cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-auto shrink-0 flex items-center justify-between border-t border-gray-800/80 pt-6 pb-4">
              <p className="text-xs text-gray-500">
                Showing page <span className="font-semibold text-gray-300">{currentPage}</span> of <span className="font-semibold text-gray-300">{totalPages}</span> ({totalCategories} total categories)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3.5 py-1.5 bg-[#151221] border border-gray-855 hover:bg-gray-800/40 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20"
                        : "bg-[#151221] border border-gray-855 text-gray-400 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3.5 py-1.5 bg-[#151221] border border-gray-855 hover:bg-gray-800/40 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reusable Create Category Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCategorySubmit}
      />

      {/* Reusable Update Category Modal */}
      <UpdateCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSubmit={handleEditCategory}
      />
    </div>
  );
}

export default AdminCategoryManagement;
