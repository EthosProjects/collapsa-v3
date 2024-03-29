#include <cstdint>
#include <algorithm>
#ifndef COLLAPSA_CONTROLLERS
#define COLLAPSA_CONTROLLERS
namespace Collapsa {
    class Player;
    namespace Vector {
        class Double {
            class Dimension {
                double value{ 0 };
                double minimum { 0 };
                double maximum { 0 };
                void bound () { if(maximum != minimum) value = std::max(minimum, std::min(maximum, value)); };
            public:
                explicit operator double() const {
                    return value;
                };
                Dimension& operator=(const double &rhs) { value = rhs; bound(); return *this; };
                Dimension& operator+=(const double &rhs) { value += rhs; bound(); return *this; };
                Dimension& operator-=(const double &rhs) { value -= rhs; bound(); return *this; };
                Dimension& operator*=(const double &rhs) { value *= rhs; bound(); return *this; };
                Dimension& operator/=(const double &rhs) { value /= rhs; bound(); return *this; };
                Dimension& operator=(const Dimension& rhs) { value = rhs.value; bound(); return *this; };
                Dimension& operator+=(const Dimension& rhs) { value += rhs.value; bound(); return *this; };
                Dimension& operator-=(const Dimension& rhs) { value -= rhs.value; bound(); return *this; };
                Dimension& operator*=(const Dimension& rhs) { value *= rhs.value; bound(); return *this; };
                Dimension& operator/=(const Dimension& rhs) { value /= rhs.value; bound(); return *this; };
                bool operator==(const Dimension& d) { return value == d.value; };
                bool operator!=(const Dimension& d) { return value != d.value; };
                Dimension(double t_value, double t_max, double t_min): value(t_value), minimum(t_max), maximum(t_min) {};
                Dimension(double t_value): 
                    value(t_value) 
                {};
                Dimension(const Dimension& t_dimension): value(t_dimension.value), minimum(t_dimension.maximum), maximum(t_dimension.minimum) {};
            };
            public:
            Dimension x;
            Dimension y;
            Double(double t_x, double t_y): x(t_x), y(t_y) {};
            Double(
                double t_x, double t_y, 
                double t_minX, double t_maxX,
                double t_minY, double t_maxY): x(t_x, t_minX, t_maxX), y(t_y, t_minY, t_maxY) {};
            Double(const Double &t_double):
                x(t_double.x), 
                y(t_double.y) 
            {};
            Double& operator=(const Double &rhs) { x = rhs.x; y = rhs.y; return *this; }; 
            Double& operator+=(const Double &rhs) { 
                x += rhs.x; 
                y += rhs.y; 
                return *this; 
            };
            Double& operator-=(const Double &rhs) { x -= rhs.x; y -= rhs.y; return *this; };
            Double& operator*=(const Double &rhs) { x *= rhs.x; y *= rhs.y; return *this; };
            Double& operator/=(const Double &rhs) { x /= rhs.x; y /= rhs.y; return *this; };
            bool operator==(const Double &d) { return x == d.x && y == d.y; };
            bool operator!=(const Double &d) { return x != d.x || y != d.y; };
            const Double& operator+(const Double &t_double) { 
                return Double(*this) += t_double; 
            };
            friend std::ostream& operator<<(std::ostream& os, const Double& dt) {
                os << "{x:" << (double) dt.x << ",y:" << (double) dt.y << "}";
                return os;
            }
        };
    };
    class Status {
        protected:
        double maximum { 0 };
        double minimum { 0 };
        double value { 0 };
        void bound () { if(maximum != minimum) value = std::max(minimum, std::min(maximum, value)); };
        Status(double t_minimum, double t_maximum, double t_value): maximum(t_maximum), minimum(t_minimum), value(t_value) {}
        Status(double t_minimum, double t_maximum): maximum(t_maximum), minimum(t_minimum), value(t_maximum) {};
        Status(double t_value): value(t_value) {}
        Status() {};
        public:
        operator double() const { return value; }
        Status& operator=(const double &rhs) { value = rhs; bound(); return *this; };
        Status& operator+=(const double &rhs) { value += rhs; bound(); return *this; };
        Status& operator-=(const double &rhs) { value -= rhs; bound(); return *this; };
        Status& operator*=(const double &rhs) { value *= rhs; bound(); return *this; };
        Status& operator/=(const double &rhs) { value /= rhs; bound(); return *this; };
    };
    class Health: public Status {
        public:
        Health(double t_minimum, double t_maximum, double t_value): Status(t_maximum, t_minimum, t_value) {}
        Health(double t_minimum, double t_maximum): Health(t_maximum, t_minimum, t_maximum) {};
        Health& operator=(const double &rhs) { value = rhs; bound(); return *this; };
    };
    /*
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
    };*/
    namespace Body {
        class IBody {
        public:
        Vector::Double position;
        Vector::Double velocity { 0, 0 };
        Vector::Double previousPosition;
            IBody(int t_x, int t_y) : position(t_x, t_y), previousPosition(t_x, t_y) {};
            IBody(Vector::Double t_position) : position(t_position), previousPosition(t_position) {};
            ~IBody() {};
            bool hasMoved { true };
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