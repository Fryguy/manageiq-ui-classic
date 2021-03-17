class ApplicationHelper::Button::GenericFeatureButton < ApplicationHelper::Button::Basic
  include ApplicationHelper

  needs :@record

  def initialize(view_context, instance_data, props)
    super
    @feature = props[:options][:feature]
  end

  def visible?
    records_support_feature?(@record, @feature)
  end
end
