import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { hasRole, getUser } from '../utils/auth';

console.log("Current user:", getUser());
console.log("Is CMMS Admin?", hasRole("CMMS Admin"));
console.log("Is Technician?", hasRole("Technician"));

const IHSidebar = () => {
  const [showUser, setShowUser] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  // const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [showPlannedMaint, setShowPlannedMaint] = useState(false);
  // const [showWorkOrder, setShowWorkOrder] = useState(false);
  // const [showWorkPermit, setShowWorkPermit] = useState(false);
  const [showSpareParts, setShowSpareParts] = useState(false);
  // const [showKPI, setShowKPI] = useState(false);
  // const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Navigation items
  // const navItems = [
  //   { name: "Work Permit", path: "/EquipmentList", end: true },
  const user = getUser();


  return (
    <aside className="fixed top-14 left-0 h-[calc(100vh-7rem)] w-64 bg-white shadow-sm border-r z-10 flex flex-col">
      <div className="p-3 flex justify-center font-semibold text-lg border-b text-white bg-[#0070EF]">DASHBOARD ({user.username}) </div>
      <nav className="flex-1 flex flex-col overflow-y-auto p-4 space-y-0">
        {/* Only CMMS Admin can see Users section */}
        {hasRole("Administrator") &&
          <>
            <button
              onClick={() => setShowUser(!showUser)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
            >
              <span className="flex items-center text-blue-400">
                <span className="mr-3 text-left "></span>
                Users
              </span>
              {showUser ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {showUser && (
              <div className="ml-8 space-y-1">
                <NavLink
                  to="/user/list"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  Users list
                </NavLink>
                <NavLink
                  to="/user/add"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  Add New User
                </NavLink>
              </div>
            )}
          </>
        }

        <button
          onClick={() => setShowEquipment(!showEquipment)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
        >
          <span className="flex items-center text-blue-400">
            <span className="mr-3 text-left "></span>
            Equipment Data
          </span>
          {showEquipment ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showEquipment && (
          <div className="ml-8 space-y-1">
            <NavLink
              to="/ih_equipment_list"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Equipment list
            </NavLink>
            <NavLink
              to="/equipment/add"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Add New Equipment
            </NavLink>
            <NavLink
              to="/equipmentHistorian"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Equipment Historian
            </NavLink>
            <NavLink
              to="equipmentCriticality"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Equipment Crticality
            </NavLink>
          </div>
        )}

        {/* Planned Maintenance Dropdown */}
        <button
          onClick={() => setShowPlannedMaint(!showPlannedMaint)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            Planned Maintenance Data
          </span>
          {showPlannedMaint ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showPlannedMaint && (
          <div className="ml-8 space-y-1">
                 <NavLink
              to="/ih_prem_pm_list"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Planned Maintenance List
            </NavLink>
            <NavLink
              to="/ih_prem_pm_add"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Add New Planned Maintenance
            </NavLink>
       
            <NavLink
              to="/ih_prem_historian"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Planned Maintenance Historian
            </NavLink>
          </div>
        )}
        
        {/* Spare Parts Dropdown */}
        <button
          onClick={() => setShowSpareParts(!showSpareParts)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            Spare Parts Data
          </span>
          {showSpareParts ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showSpareParts && (
          <div className="ml-8 space-y-1">
            <NavLink
              to="/ih_spares_list"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Spare Parts list
            </NavLink>
            <NavLink
              to="sp"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Add New Spare Part
            </NavLink>
          </div>
        )}

        {/* FMEA Dropdown */}
        <button
          onClick={() => setShowSpareParts(!showSpareParts)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            FMEA Data
          </span>
          {showPlannedMaint ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showSpareParts && (
          <div className="ml-8 space-y-1">
            <NavLink
              to="/sp"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              FMEA list
            </NavLink>
            <NavLink
              to="sp"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Add New Asset Failure Mode
            </NavLink>
          </div>
        )}

        {/* Opex Dropdown */}
        <button
          onClick={() => setShowSpareParts(!showSpareParts)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            Opex Data
          </span>
          {showPlannedMaint ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showSpareParts && (
          <div className="ml-8 space-y-1">
            <NavLink
              to="/sp"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Opex list
            </NavLink>
            <NavLink
              to="sp"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Add New Item
            </NavLink>
          </div>
        )}


        
        {/* AI Assistance Dropdown */}
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            AI Assistance
          </span>
          {showPlannedMaint ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        {showAIAssistant && (
          <div className="ml-8 space-y-1">
            <NavLink
              to="/AI"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/AI"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Predictions
            </NavLink>
          </div>
        )} 
      </nav>
    </aside>
  );
}



export default IHSidebar;