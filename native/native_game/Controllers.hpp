#include <cstdint>
#include <algorithm>
#ifndef COLLAPSA_CONTROLLERS
#define COLLAPSA_CONTROLLERS
namespace Collapsa {
    class Player;
    namespace Position {
        class Overwrite {
        public:
            int16_t x;
            int16_t y;
            Overwrite(int t_x, int t_y) : x(t_x), y(t_y) {}
        };
        class Options {
        public:
            int16_t minX;
            int16_t maxX;
            int16_t minY;
            int16_t maxY;
            Options(int16_t t_minX, int16_t t_maxX, int16_t t_minY, int16_t t_maxY) :
                minX(t_minX),
                maxX(t_maxX),
                minY(t_minY),
                maxY(t_maxY) {};
            Options() :
                minX(0),
                maxX(255),
                minY(0),
                maxY(255) {};
        };
        class Controller {
            int16_t m_x;
            int16_t m_y;
            Options m_options;
        public:
            virtual int getX() { return m_x; };
            virtual int getY() { return m_y; };
            virtual void setX(int16_t val) { m_x = val; };
            virtual void setY(int16_t val) { m_y = val; };
            Controller(): m_x(0), m_y(0) {};
            Controller(int t_x, int t_y) : m_x(t_x), m_y(t_y) {};
            Controller(Options t_options, int t_x, int t_y) :m_x(t_x), m_y(t_y), m_options(t_options) {};
            Controller(Options t_options) : m_x(t_options.minX), m_y(t_options.minY), m_options(t_options) {};
            Controller(Overwrite t_overwrite) : m_x(t_overwrite.x), m_y(t_overwrite.y) {};
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
            Position::Overwrite getPosition() { return Position::Overwrite(position.getX(), position.getY()); };
            void setPosition(Collapsa::Position::Controller newPos) {
                prevPosition.setX(position.getX());
                prevPosition.setY(position.getY());
                position.setX(newPos.getX());
                position.setY(newPos.getY());
            };
            IBody() {};
            IBody(int t_x, int t_y) : position(t_x, t_y), prevPosition(t_x, t_y) {};
            IBody(Position::Overwrite t_positionOverwrite) : position(t_positionOverwrite), prevPosition(t_positionOverwrite) {};
            ~IBody() {};
        protected:
            Collapsa::Position::Controller position;
            Collapsa::Position::Controller prevPosition;
        };
        class Circle : public IBody {
        protected:
            uint32_t m_radius;
        public:
            Circle(int t_radius): m_radius(t_radius) {};
            Circle(int t_radius, Position::Overwrite t_positionOverwrite) : IBody(t_positionOverwrite), m_radius(t_radius) {};
            ~Circle() {};
            uint32_t getRadius() { return m_radius; };
        };
    }
};
#endif