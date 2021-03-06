class HomeroomsController < ApplicationController
  include StudentsQueryHelper

  def homeroom_json
    homeroom = authorize_and_assign_homeroom!(params[:id])

    rows = eager_students(homeroom).map {|student| fat_student_hash(student) }

    # For navigation
    allowed_homerooms = current_educator.allowed_homerooms.order(:name)

    render json: {
      homeroom: homeroom.as_json(only: [:id, :slug, :name, :grade]),
      school: homeroom.school,
      rows: rows,
      homerooms: allowed_homerooms.as_json(only: [:id, :slug, :name, :grade])
    }
  end

  private
  def eager_students(homeroom, *additional_includes)
    homeroom.students.active.includes([
      :event_notes,
      :interventions,
      :homeroom,
    ] + additional_includes)
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    HashWithIndifferentAccess.new(student_hash_for_slicing(student).merge({
      event_notes_without_restricted: student.event_notes_without_restricted,
      interventions: student.interventions,
      sped_data: student.sped_data,
    }))
  end

  def authorize_and_assign_homeroom!(homeroom_id_or_slug)
    homeroom = Homeroom.friendly.find(homeroom_id_or_slug)
    raise Exceptions::EducatorNotAuthorized unless current_educator.allowed_homerooms.include? homeroom
    homeroom
  end
end
