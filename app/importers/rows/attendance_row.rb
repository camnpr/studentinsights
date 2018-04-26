class AttendanceRow < Struct.new(:row)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  #
  # Expects the following headers:
  #
  # :state_id, :local_id, :absence, :tardy, :event_date, :school_local_id

  class NullRelation
    class NullEventErrors
      def messages; "Neither absence nor tardy" end
    end

    class NullEvent
      def save; end

      def valid?; false end

      def errors; NullEventErrors.new end

      def assign_attributes(attributes); end
    end

    def self.find_or_initialize_by(_)
      NullEvent.new
    end
  end

  def self.build(row)
    new(row).build
  end

  def build
    attendance_event = attendance_event_class.find_or_initialize_by(
      occurred_at: row[:event_date],
      student_id: student.try(:id),
    )

    if PerDistrict.new.import_detailed_attendance_fields?
      attendance_event.assign_attributes(
        dismissed: row[:dismissed],
        excused: row[:excused],
        reason: row[:reason],
        comment: row[:comment],
      )
    end

    return attendance_event
  end

  private

  def attendance_event_class
    return Absence if row[:absence].to_i == 1
    return Tardy if row[:tardy].to_i == 1
    NullRelation
  end

  def student
    Student.find_by_local_id(row[:local_id])
  end

end
