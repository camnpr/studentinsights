class ProfilePdfController < ApplicationController
  include ApplicationHelper

  before_action :authorize!

  def student_report
    set_up_student_report_data
    footer_text = "#{PerDistrict.new.district_name} Student Report -- Generated #{format_date_for_student_report(todays_date_for_student_report)} by #{current_educator.full_name} -- Page [page] of [topage]"

    # KR: not sure why, but JS isn't running locally for me or on Travis, so
    # disabling this check since we aren't testing anything generated by JS
    # anyway.
    wait_for_js = if params[:disable_js] && Rails.env.test? then
      {}
    else
      { window_status: 'READY' }
    end

    respond_to do |format|
      format.pdf do
        render(wait_for_js.merge({
          pdf: 'student_report',
          title: 'Student Report',
          footer: { center: footer_text, font_name: 'Open Sans', font_size: 9},
          show_as_html: params.key?('debug')
        }))
      end
    end
  end

  private
  def authorize!
    student = Student.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def set_up_student_report_data
    @student = Student.find(params[:id])
    @current_educator = current_educator
    @sections = (params[:sections] || "").split(",")

    @filter_from_date = params[:from_date] ? Date.strptime(params[:from_date],  "%m/%d/%Y") : Date.today
    @filter_to_date = (params[:from_date] ? Date.strptime(params[:to_date],  "%m/%d/%Y") : Date.today).advance(days: 1) # so we include the current day

    # Load event notes that are NOT restricted for the student for the filtered dates
    @event_notes = @student.event_notes.where(:is_restricted => false).where(recorded_at: @filter_from_date..@filter_to_date)

    # Load services for the student for the filtered dates
    @services = @student.services.where("date_started <= ? AND (discontinued_at >= ? OR discontinued_at IS NULL)", @filter_to_date, @filter_from_date).order('date_started, discontinued_at')

    # Load student school years for the filtered dates
    @student_school_years = @student.events_by_student_school_years(@filter_from_date, @filter_to_date)

    # Sort the discipline incidents by occurrance date
    @discipline_incidents = @student.discipline_incidents.sort_by(&:occurred_at).select do |hash|
      hash[:occurred_at] >= @filter_from_date && hash[:occurred_at] <= @filter_to_date
    end

    # This is a hash with the test name as the key and an array of date-sorted student assessment objects as the value
    student_assessments_by_date = @student.student_assessments.order_by_date_taken_asc.includes(:assessment).where(date_taken: @filter_from_date..@filter_to_date)

    @student_assessments = student_assessments_by_date.each_with_object({}) do |student_assessment, hash|
      test = student_assessment.assessment
      test_name = "#{test.family} #{test.subject}"

      hash[test_name] ||= []

      result = case test.family
        when "MCAS" then student_assessment.scale_score
        when "Next Gen MCAS" then student_assessment.scale_score
        else student_assessment.scale_score
      end

      hash[test_name].push([student_assessment.date_taken, result])
    end.sort.to_h

    @star_math_results = @student.star_math_results.order(date_taken: :asc)
                                 .where(date_taken: @filter_from_date..@filter_to_date)
                                 .map { |star| [star.date_taken, star.percentile_rank] }
    @star_reading_results = @student.star_reading_results.order(date_taken: :asc)
                                 .where(date_taken: @filter_from_date..@filter_to_date)
                                 .map { |star| [star.date_taken, star.percentile_rank] }

    @student_assessments['STAR Math Percentile'] = @star_math_results
    @student_assessments['STAR Reading Percentile'] = @star_reading_results

    @dibels_results = @student.dibels_results.order(date_taken: :asc)
                              .where(date_taken: @filter_from_date..@filter_to_date)
                              .map { |dibels| [dibels.date_taken, dibels.benchmark] }

    @student_assessments['DIBELS'] = @dibels_results

    @serialized_data = {
      graph_date_range: {
        filter_from_date: @filter_from_date.to_time,
        filter_to_date: @filter_to_date
      },
      attendance_data: {
        discipline_incidents: @student.discipline_incidents.order(occurred_at: :desc),
        tardies: @student.tardies.order(occurred_at: :desc),
        absences: @student.absences.order(occurred_at: :desc)
      }
    }
  end

  # Add this as a helper method that the ERB template can call
  helper_method :format_date_for_student_report
  def format_date_for_student_report(date)
    date.strftime("%m/%d/%Y")
  end

  def todays_date_for_student_report
    Time.now.in_time_zone('Eastern Time (US & Canada)').to_date
  end
end
