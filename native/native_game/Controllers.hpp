#include <cstdint>
#include <algorithm>
#ifndef COLLAPSA_CONTROLLERS
#define COLLAPSA_CONTROLLERS
namespace Collapsa {
    class Player;
    namespace Vector {
        class Double {
            class Dimension {
                double value;
            public:
                operator double() const { return value; }
                Dimension& operator+=(const double &rhs) { value += rhs; return *this; };
                Dimension& operator-=(const double &rhs) { value -= rhs; return *this; };
                Dimension& operator*=(const double &rhs) { value *= rhs; return *this; };
                Dimension& operator/=(const double &rhs) { value /= rhs; return *this; };
                Dimension(double t_value): value(t_value) {};
            };
            public:
            Dimension x;
            Dimension y;
            Double(double t_x, double t_y): x(t_x), y(t_y) {};
            Double(const Double &t_double): x(t_double.x), y(t_double.y) {};
            Double& operator=(const Double &rhs) { x = rhs.x; y = rhs.y; return *this; }; 
            Double& operator+=(const Double &rhs) { x += rhs.x; y += rhs.y; return *this; };
            Double& operator-=(const Double &rhs) { x -= rhs.x; y -= rhs.y; return *this; };
            Double& operator*=(const Double &rhs) { x *= rhs.x; y *= rhs.y; return *this; };
            Double& operator/=(const Double &rhs) { x /= rhs.x; y /= rhs.y; return *this; };
            const Double& operator+(const Double &t_double) { return Double(*this) += t_double; };
        };
    };
    namespace Health {
        class Damage {
            int16_t type;
            int16_t amount;
            int32_t length;
            int64_t start;
        public:
            Damage(int16_t initialType, int16_t initialAmount, int32_t initialLength, int64_t initialStart) :
                type(initialType),
                amount(initialAmount),
                length(initialLength),
                start(initialStart) {}
        };
        class Options {
        public:
            int minimum;
            int maximum;
            Options(int t_minimum, int t_maximum) :minimum(t_minimum), maximum(t_maximum) {}
        };
        class Controller {
            int m_value;
            Options m_option;
        public:
            void setHealth(int t_health) {
                t_health = std::min(t_health, m_option.maximum);
                t_health = std::max(t_health, m_option.maximum);
                m_value = t_health;
            }
            int getHealth() { return m_value; };
            Controller(Options t_option) : m_value(t_option.maximum), m_option(t_option) {};
        };
    }
    namespace Body {
        class IBody {
        public:
        Vector::Double position;
        Vector::Double previousPosition;
            IBody(int t_x, int t_y) : position(t_x, t_y), previousPosition(t_x, t_y) {};
            IBody(Vector::Double t_position) : position(t_position), previousPosition(t_position) {};
            ~IBody() {};
            bool hasMoved { 0 };
        };
        class Circle : public IBody {
        public:
            Circle(int t_radius, Vector::Double t_position) : IBody(t_position), radius(t_radius) {};
            ~Circle() {};
            uint32_t radius;
        };
    }
};
#endif