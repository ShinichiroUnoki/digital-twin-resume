cmake_minimum_required(VERSION 3.16)
project(robot_sim VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    src/kinematics.cpp
    src/trajectory.cpp
    src/bindings.cpp
)

# Include directories
include_directories(include)

if(EMSCRIPTEN)
    # Emscripten build for WebAssembly
    add_executable(robot_sim ${SOURCES})
    
    # Emscripten compile flags
    set_target_properties(robot_sim PROPERTIES
        SUFFIX ".js"
        LINK_FLAGS "--bind -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='createRobotSim' -s ALLOW_MEMORY_GROWTH=1 -s SINGLE_FILE=0 -O3"
    )
    
    # Optional: Link with Eigen and Ruckig if available
    # find_package(Eigen3)
    # find_package(ruckig)
    # if(Eigen3_FOUND)
    #     target_link_libraries(robot_sim PRIVATE Eigen3::Eigen)
    # endif()
    # if(ruckig_FOUND)
    #     target_link_libraries(robot_sim PRIVATE ruckig::ruckig)
    # endif()
else()
    # Native build for testing
    add_library(robot_sim_lib STATIC ${SOURCES})
    
    # Test executable
    add_executable(robot_sim_test tests/test_main.cpp)
    target_link_libraries(robot_sim_test PRIVATE robot_sim_lib)
endif()
