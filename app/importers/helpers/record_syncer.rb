# For syncing between a CSV snapshot and an Insights model, particularly
# for tracking and then removing records in Insights that have been removed
# in the CSV snapshot.
#
# Callers have to match the CSV row to an Insights record, and describe
# what Insights records are within the window or scope of the sync.
class RecordSyncer
  def initialize(options = {})
    @log = options.fetch(:log)

    @passed_nil_record_count = 0
    @invalid_rows_count = 0
    @unchanged_rows_count = 0
    @updated_rows_count = 0
    @created_rows_count = 0

    @marked_ids = []
  end

  # Given a new or persisted record, with attributes updated in memory
  # based on the CSV, update it in the Insights database.
  # Also track that the Insights record still exists in the current CSV snapshot.
  def validate_mark_and_sync!(insights_record)
    # Passed nil, something failed upstream
    if insights_record.nil?
      @passed_nil_record_count += 1
      return :nil
    end

    # This would fail the validation, so don't try to sync it.
    # If for some edge case reason this is an existing persisted record
    # (eg, maybe it was created once, then we changed the validations and now it
    # would be invalid).  By returning early and not marking it,
    # invalid records like this will get purged by `delete_unmarked_records!`
    if !insights_record.valid?
      @invalid_rows_count += 1
      return :invalid
    end

    # For each outcome below, mark the Insights records that match ones in the CSV,
    # so that afterward we can remove ones within the import
    # scope that don't (they've been removed from the CSV).
    # Nothing has changed, update or create
    if insights_record.persisted? && !insights_record.changed?
      @unchanged_rows_count += 1
      mark_insights_record(insights_record)
      return :unchanged
    elsif insights_record.persisted?
      @updated_rows_count += 1
      insights_record.save!
      mark_insights_record(insights_record)
      return :updated
    else
      @created_rows_count += 1
      insights_record.save!
      mark_insights_record(insights_record)
      return :created
    end
  end

  # Delete Insights records that are no longer in the CSV snapshot.
  # (eg, the record was deleted upstream).
  #
  # The caller has to describe what records are in scope of the import (eg,
  # particular schools, date ranges, etc.) and this returns the count of deleted records.
  def delete_unmarked_records!(records_within_import_scope)
    log("delete_unmarked_records")
    log("  records_within_import_scope.size: #{records_within_import_scope.size} in Insights")
    log("  @marked_ids.size = #{@marked_ids.size} from this import")

    unmarked_ids = records_within_import_scope.pluck(:id) - @marked_ids
    log("  unmarked_ids: #{unmarked_ids.inspect}") if unmarked_ids.size < 10

    records_to_destroy = records_within_import_scope.where(id: unmarked_ids)
    log("  records_to_destroy.size: #{records_to_destroy.size} within scope")

    # This is slow, but intentionally runs validations, hooks, etc. on each record
    # individually to be conservative.
    records_to_destroy.each_with_index do |record, index|
      record.destroy!
      log("  destroyed #{index} rows.") if index > 0 && index % 100 == 0
    end

    @destroyed_records_count = records_to_destroy.size
  end

  # For debugging and testing
  def stats
    {
      passed_nil_record_count: @passed_nil_record_count,
      invalid_rows_count: @invalid_rows_count,
      unchanged_rows_count: @unchanged_rows_count,
      updated_rows_count: @updated_rows_count,
      created_rows_count: @created_rows_count,
      marked_ids_count: @marked_ids.size,
      destroyed_records_count: @destroyed_records_count,
    }
  end

  private
  # Mark which Insights records match a row in the CSV.
  # We'll delete the ones that don't (with the scope of the import) afterward.
  def mark_insights_record(insights_record)
    @marked_ids << insights_record.id
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "RecordSyncer: #{text}"
  end
end
