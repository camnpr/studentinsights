class SchoolFilter < Struct.new(:school_scope)
  def include?(row)
    school_scope.nil? || school_scope.include?(row[:school_local_id])
  end
end
