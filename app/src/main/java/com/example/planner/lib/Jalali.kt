package com.example.planner.lib

import java.util.Calendar

/**
 * Pure-Kotlin Jalali (Shamsi) calendar. Faithful Kotlin port of the battle-tested
 * jalaali-js algorithm (no external dependency).
 */
data class JDate(val year: Int, val month: Int, val day: Int) {
    val monthName: String get() = JDate.MONTHS[month - 1]
    val weekdayName: String get() = JDate.WEEKDAYS[weekday]
    val weekday: Int get() { val g = JDate.toGregorianArray(year, month, day); return JDate.calWeekday(g[0], g[1], g[2]) }
    override fun toString(): String = "$year/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}"

    fun toGregorian(): GreDate { val g = JDate.toGregorianArray(year, month, day); return GreDate(g[0], g[1], g[2]) }
    fun toKey(): String = "%04d-%02d-%02d".format(year, month, day)

    companion object {
        val MONTHS = arrayOf(
            "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
            "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
        )
        val WEEKDAYS = arrayOf("شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه")

        fun today(): JDate {
            val c = Calendar.getInstance()
            return fromGregorian(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH))
        }

        fun nowKey(): String = today().toKey()

        fun fromGregorian(gy: Int, gm: Int, gd: Int): JDate {
            val j = d2j(g2d(gy, gm, gd))
            return JDate(j[0], j[1], j[2])
        }
        fun fromGregorian(g: GreDate): JDate = fromGregorian(g.year, g.month, g.day)
        fun fromKey(s: String): JDate? {
            val p = s.split("-"); if (p.size != 3) return null
            return try { JDate(p[0].toInt(), p[1].toInt(), p[2].toInt()) } catch (e: Exception) { null }
        }

        fun daysInMonth(jy: Int, jm: Int): Int = when {
            jm <= 6 -> 31
            jm < 12 -> 30
            else -> if (isLeap(jy)) 30 else 29
        }

        fun isLeap(jy: Int): Boolean =
            j2d(jy + 1, 1, 1) - j2d(jy, 1, 1) > 365

        fun toGregorianArray(jy: Int, jm: Int, jd: Int): IntArray = d2g(j2d(jy, jm, jd))

        fun calWeekday(gy: Int, gm: Int, gd: Int): Int {
            val c = Calendar.getInstance(); c.clear(); c.set(gy, gm - 1, gd)
            return (c.get(Calendar.DAY_OF_WEEK) + 1) % 7 // 0=Sat..6=Fri
        }

        // --- day-number arithmetic (jalaali-js) ---------------------------
        private fun div(a: Int, b: Int): Int = a / b
        private fun divL(a: Long, b: Long): Long = a / b

        fun g2d(gy: Int, gm: Int, gd: Int): Long {
            var d = (globalDiv((gy + (gm - 8) / 6 + 100100) * 1461L, 4L)
                + globalDiv(153L * ((gm + 9) % 12) + 2, 5L)
                + gd - 34840408L)
            d = d - globalDiv(globalDiv((gy + 100100 + (gm - 8) / 6).toLong(), 100L) * 3L, 4L) + 752L
            return d
        }

        private fun globalDiv(a: Long, b: Long): Long {
            var q = a / b
            return if (a % b < 0 && q < 0) q - 1 else q
        }

        private fun d2g(jdn: Long): IntArray {
            var j = 4 * jdn + 139361631L
            j = j + globalDiv(globalDiv(4L * jdn + 183187720L, 146097L) * 3L, 4L) * 4L - 3908L
            val i = globalDiv(remainder(j, 1461L), 4L) * 5L + 308L
            val gd = globalDiv(remainder(i, 153L), 5L) + 1L
            val gm = remainder(globalDiv(i, 153L), 12L) + 1L
            val gy = globalDiv(j, 1461L) - 100100L + globalDiv(8L - gm, 6L)
            return intArrayOf(gy.toInt(), gm.toInt(), gd.toInt())
        }

        private fun remainder(a: Long, b: Long): Long { val r = a % b; return if (r < 0) r + b else r }

        /** Gregorian day number of 1 Farvardin <jy>. */
        private fun farvardin1(jy: Int): Long {
            val gy = jy + 621
            var leapJ = -14L
            var jp = BREAKS[0]
            for (i in 1 until BREAKS.size) {
                val jm = BREAKS[i]
                val jump = jm - jp
                if (jy < jm) break
                leapJ += globalDiv(jump.toLong(), 33L) * 8L + globalDiv(((jump % 33).toLong()), 4L)
                jp = jm
            }
            var n = jy - jp
            leapJ += globalDiv(n.toLong(), 33L) * 8L + globalDiv((((n % 33) + 3).toLong()), 4L)
            val leapG = globalDiv(gy.toLong(), 4L) - globalDiv(globalDiv(gy.toLong(), 100L) + 1L, 4L) * 3L - 150L
            val march = 20 + leapJ - leapG
            return g2d(gy, 3, march.toInt())
        }

        fun j2d(jy: Int, jm: Int, jd: Int): Long =
            farvardin1(jy) + (jm - 1) * 31L - (jm / 7) * (jm - 7) + (jd - 1)

        private fun d2j(jdn: Long): IntArray {
            val gy = d2g(jdn)[0]
            var jy = gy - 621
            var f1 = farvardin1(jy)
            if (jdn < f1) { jy -= 1; f1 = farvardin1(jy) }
            var k = (jdn - f1)
            var jm = 1
            while (true) {
                val dm = daysInMonthLong(jy, jm)
                if (k < dm) break
                k -= dm
                jm += 1
            }
            return intArrayOf(jy, jm, (k + 1).toInt())
        }

        private fun daysInMonthLong(jy: Int, jm: Int): Long = daysInMonth(jy, jm).toLong()

        private val BREAKS = intArrayOf(
            -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181,
            1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
        )
    }
}

data class GreDate(val year: Int, val month: Int, val day: Int) {
    fun toJalali(): JDate = JDate.fromGregorian(this)
    fun toKey(): String = "%04d-%02d-%02d".format(year, month, day)
    companion object {
        fun today(): GreDate { val c = Calendar.getInstance(); return GreDate(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH)) }
    }
}

/** One Monday..not cell of the Jalali month grid. */
data class JDay(val jdate: JDate, val weekday: Int, val inMonth: Boolean)

/** 6-week x 7 grid of a Jalali month, week starts Saturday. */
fun jmonthGrid(jyear: Int, jmonth: Int): List<List<JDay>> {
    val dcount = JDate.daysInMonth(jyear, jmonth)
    val g1 = JDate.toGregorianArray(jyear, jmonth, 1)
    val wd1 = JDate.calWeekday(g1[0], g1[1], g1[2])
    val cells = MutableList(42) { idx ->
        val jd = idx - wd1 + 1
        val inMonth = jd in 1..dcount
        JDay(if (inMonth) JDate(jyear, jmonth, jd) else JDate(jyear, jmonth, jd.coerceIn(1, dcount)), idx % 7, inMonth)
    }
    return cells.chunked(7)
}
