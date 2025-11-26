"""
Core package initializer.

We install PyMySQL as a drop-in replacement for MySQLdb on Windows
so Django can connect without compiling `mysqlclient`.
"""
import pymysql

pymysql.install_as_MySQLdb()
